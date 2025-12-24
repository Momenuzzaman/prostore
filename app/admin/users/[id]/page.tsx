import { getUserById } from "@/lib/actions/user.action";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Update User",
};

const AdminUserUserPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const user = await getUserById(id);
  if (!user) notFound();
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="h2-bold">Update User</h1>
    </div>
  );
};

export default AdminUserUserPage;
