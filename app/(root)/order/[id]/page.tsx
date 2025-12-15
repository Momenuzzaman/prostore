import { getOrderById } from "@/lib/actions/order.actions";
import OrderDetailsTable from "./order-details-table";
import { notFound } from "next/navigation";

const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  const order = await getOrderById(id);

  if (!order.success) return notFound();

  return <OrderDetailsTable order={order.data} />;
};

export default OrderDetailsPage;
