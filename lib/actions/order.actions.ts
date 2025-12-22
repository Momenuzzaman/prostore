"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.action";
import { getUserById } from "./user.action";
import { insertOrderSchema } from "../validators";
import { CartItem, Order, PaymentResult, ShippingAddress } from "@/types";
import prisma from "@/db/prisma";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createOder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User not found");

    const cart = await getMyCart();
    const userId = session.user.id;
    if (!userId) throw new Error("User not found");
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    // Create Order
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // Create a transaction to create order and order items in database
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // Create order
      const insertedOrder = await tx.order.create({ data: order });

      // Create order items from the cart items
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
        },
      });
      return insertedOrder.id;
    });
    if (!insertedOrderId) throw new Error("Order not created");
    return {
      success: true,
      message: "Order created successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
    };
  }
}

type OrderResult =
  | { success: true; data: Order }
  | { success: false; message: string };

export async function getOrderById(orderId: string): Promise<OrderResult> {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    const plainOrder = convertToPlainObject(order);

    return {
      success: true,
      data: {
        ...plainOrder,
        shippingAddress: plainOrder.shippingAddress as ShippingAddress,
      } as Order,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getMyOrders({
  limit = PAGE_SIZE,
  page = 1,
}: {
  limit?: number;
  page?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("User not found");

  const skip = (page - 1) * limit;

  const [orders, orderCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: { orderItems: true },
    }),
    prisma.order.count({
      where: { userId: session.user.id },
    }),
  ]);

  return {
    orders,
    totalPages: Math.ceil(orderCount / limit),
    currentPage: page,
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

export async function getOrdersSummary() {
  // 1️⃣ Get counts
  const orderCount = await prisma.order.count();
  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();

  // 2️⃣ Calculate total sales
  const totalSalesAgg = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });
  const totalSales = totalSalesAgg._sum.totalPrice ?? 0;

  // 3️⃣ Get monthly sales
  // Use alias lowercase and cast to numeric for Prisma Decimal
  const salesDataRow = await prisma.$queryRaw<
    Array<{ month: string; totalsales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'YYYY-MM') as month, SUM("totalPrice")::numeric as totalsales
    FROM "Order"
    GROUP BY month
    ORDER BY month ASC`;

  const salesData: SalesDataType = salesDataRow.map((item) => ({
    month: item.month,
    totalSales: item.totalsales?.toNumber() ?? 0,
  }));

  // 4️⃣ Get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    take: 6,
  });

  return {
    orderCount,
    productCount,
    userCount,
    salesData,
    latestSales,
    totalSales,
  };
}

// Get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });
  const dataCount = await prisma.order.count();
  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from database
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
    },
  });

  if (!order) throw new Error("Order not found");

  if (order.isPaid) throw new Error("Order is already paid");

  // transaction to update order for product stock
  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: -item.qty,
          },
        },
      });
    }
    // set to order paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult: paymentResult,
      },
    });
  });
  const updatedOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItems: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  if (!updatedOrder) throw new Error("Order not found");
}

// Update COD order to paid

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Order updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update COD order to delivered
export async function updateOrderToDelivered(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");
    if (!order.isPaid) throw new Error("Order is not paid");
    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });
    revalidatePath(`/order/${orderId}`);
    return {
      success: true,
      message: "Order updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function deliverOrder(orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
  });
  if (!order) throw new Error("Order not found");
  if (!order.isPaid) throw new Error("Order is not paid");

  await prisma.order.update({
    where: { id: orderId },
    data: {
      isDelivered: true,
      deliveredAt: new Date(),
    },
  });
  revalidatePath(`/order/${orderId}`);
  return {
    success: true,
    message: "Order updated successfully",
  };
}
