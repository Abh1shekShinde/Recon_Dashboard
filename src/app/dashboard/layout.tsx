import { redirect } from "next/navigation";
import { logout } from "./actions";
import { createClient } from "../supabase/server";

type DashBoardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: Readonly<DashBoardLayoutProps>) {
  //im checking if user logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  //if not found ill redirect to login
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-200">
      <nav className="flex items-center justify-between border-b bg-gray-700 px-6 py-4">
        <span className="font-semibold">Recon Dashboard</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">{user.email}</span>
          <form action={logout}>
            <button className="rounded border px-3 py-1.5 hover:bg-gray-50">
              Log out
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
