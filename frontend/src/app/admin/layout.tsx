import type { Metadata } from "next";
import { AdminNav } from "./components/AdminNav";

export const metadata: Metadata = {
  title: "FTS Admin | 가맹점 관리",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-layout min-h-screen bg-slate-50" data-admin-shell>
      <AdminNav />
      {children}
    </div>
  );
}
