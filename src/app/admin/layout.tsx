import AdminProtected from "@/src/components/AdminProtected";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminProtected>{children}</AdminProtected>;
}
