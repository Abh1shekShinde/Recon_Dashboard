type CardProps = {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
};

export default function Card(props: Readonly<CardProps>) {
  const { label, value, tone } = props;

  const toneClass =
    tone === "good"
      ? "text-green-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-red-600"
          : "text-gray-900";

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
