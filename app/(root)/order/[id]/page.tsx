import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "./order-details-table";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order.success) return notFound();
  const session = await auth();
  return (
    <OrderDetailsTable
      order={order.data}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
