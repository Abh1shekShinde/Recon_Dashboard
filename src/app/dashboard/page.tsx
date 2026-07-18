import UploadForm from "@/components/UploadForm";
import Dashboard from "@/components/Dashboard";
import { createClient } from "../supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders, count: orderCount } = await supabase
    .from("orders")
    .select("order_id, net_amount, status", { count: "exact" });

  const { count: paymentCount } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true });

  const { data: discrepancies } = await supabase
    .from("discrepancies")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: cachedSummary } = await supabase
    .from("dashboard_summaries")
    .select("summary")
    .eq("user_id", user?.id) // you'll need `user` here — pull it from supabase.auth.getUser() same as elsewhere
    .maybeSingle();

  const hasData = (orderCount ?? 0) > 0;

  if (!hasData) {
    return <UploadForm />;
  }

  return (
    <Dashboard
      orders={orders ?? []}
      orderCount={orderCount ?? 0}
      paymentCount={paymentCount ?? 0}
      discrepancies={discrepancies ?? []}
      initialSummary={cachedSummary?.summary}
    />
  );
}
