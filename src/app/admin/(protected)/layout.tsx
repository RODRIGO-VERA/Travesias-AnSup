import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const session = getSessionFromCookies();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-sand-50">
      <AdminSidebar email={session.email} />
      <div className="flex-1 min-w-0">
        <div className="md:hidden border-b border-sand-200 bg-white p-3 text-sm text-stone">
          Panel administrativo — usa un computador o tablet para la mejor experiencia.
        </div>
        {children}
      </div>
    </div>
  );
}
