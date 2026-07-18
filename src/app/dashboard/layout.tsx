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
    <div className="min-h-screen bg-gray-300">
      <nav className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Recon<span className="text-emerald-400">IQ</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Reconciliation Dashboard
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">{user.email}</span>
            <form action={logout}>
              <button className="rounded border border-slate-700 px-3 py-1.5 text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}
