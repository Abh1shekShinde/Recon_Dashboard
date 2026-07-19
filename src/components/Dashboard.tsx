"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import Card from "./Card";
import { Discrepancy, Order, Summary, TYPE_LABELS } from "@/app/common/types";
import DashboardSummary from "./DashboardSummary";
import ExplainLink from "./ExplainRowLink";

type DashBoardProps = {
  orders: Order[];
  orderCount: number;
  paymentCount: number;
  discrepancies: Discrepancy[];
  initialSummary: Summary | null;
};

function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function Dashboard(props: Readonly<DashBoardProps>) {
  const { orders, orderCount, paymentCount, discrepancies, initialSummary } =
    props;

  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([]);

  // --- Headline figures ---
  const { totalOrderValue, moneyAtRisk, valueInDispute, valueReconciled } =
    useMemo(() => {
      const flaggedOrderIds = new Set(
        discrepancies.map((d) => d.order_id).filter(Boolean),
      );

      const totalOrderValue = orders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.net_amount ?? 0), 0);

      const valueInDispute = orders
        .filter((o) => flaggedOrderIds.has(o.order_id))
        .reduce((sum, o) => sum + (o.net_amount ?? 0), 0);

      const moneyAtRisk = discrepancies.reduce(
        (sum, d) => sum + Math.abs(d.amount_at_risk),
        0,
      );
      const valueReconciled = totalOrderValue - valueInDispute;

      return { totalOrderValue, moneyAtRisk, valueInDispute, valueReconciled };
    }, [orders, discrepancies]);

  // --- Chart data: count + amount at risk per type ---
  const chartData = useMemo(() => {
    const byType = new Map<string, { count: number; amount: number }>();
    for (const d of discrepancies) {
      const existing = byType.get(d.discrepancy_type) ?? {
        count: 0,
        amount: 0,
      };
      existing.count += 1;
      existing.amount += Math.abs(d.amount_at_risk);
      byType.set(d.discrepancy_type, existing);
    }
    return Array.from(byType.entries()).map(([type, v]) => ({
      type: TYPE_LABELS[type] ?? type,
      count: v.count,
      amount: Math.round(v.amount * 100) / 100,
    }));
  }, [discrepancies]);

  // --- Drill-down table ---
  const columnHelper = createColumnHelper<Discrepancy>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("order_id", { header: "Order" }),
      columnHelper.accessor("transaction_ref", {
        header: "Transaction",
        cell: (info) => info.getValue() ?? "—",
      }),
      columnHelper.accessor("discrepancy_type", {
        header: "Type",
        cell: (info) => TYPE_LABELS[info.getValue()] ?? info.getValue(),
      }),
      columnHelper.accessor("amount_at_risk", {
        header: "Amount at risk",
        cell: (info) => formatCurrency(Math.abs(info.getValue())),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => <ExplainLink discrepancyId={info.row.original.id} />,
      }),
    ],
    [columnHelper],
  );

  const filteredData = useMemo(() => {
    if (typeFilter === "all") return discrepancies;
    return discrepancies.filter((d) => d.discrepancy_type === typeFilter);
  }, [discrepancies, typeFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Summary</h1>
        <a href="/dashboard/reupload" className="text-sm underline">
          Re-upload data
        </a>
      </div>

      {/* Headline cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card label="Total orders" value={orderCount.toString()} />
        <Card label="Total payments" value={paymentCount.toString()} />
        <Card
          label="Value reconciled"
          value={formatCurrency(valueReconciled)}
          tone="good"
        />
        <Card
          label="Value in dispute"
          value={formatCurrency(valueInDispute)}
          tone="warn"
        />
        <Card
          label="Money at risk"
          value={formatCurrency(moneyAtRisk)}
          tone="bad"
        />
      </div>
      <DashboardSummary initialSummary={initialSummary} />
      {/* Breakdown chart */}
      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          Discrepancies by type
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="type"
              tick={{ fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                if (name === "amount" && typeof value === "number") {
                  return formatCurrency(value);
                }

                return value ?? "";
              }}
            />
            <Bar yAxisId="left" dataKey="count" fill="#4E61D3" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drill-down table */}
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Discrepancies</h2>
          <input
            type="text"
            placeholder="Search order or transaction…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded border px-3 py-1.5 text-sm"
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {filteredData.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No discrepancies match this filter.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b text-left text-gray-500">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer py-2 pr-4 font-medium"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{ asc: " ↑", desc: " ↓" }[
                        header.column.getIsSorted() as string
                      ] ?? ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2 pr-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
