type Trend = "up" | "down" | "neutral";

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  trend?: Trend;
  trendLabel?: string;
  icon: React.ReactNode;
  accent?: "blue" | "sky" | "indigo" | "cyan";
};

const accentStyles = {
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  sky: "bg-sky-50 text-sky-600 ring-sky-100",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  cyan: "bg-cyan-50 text-cyan-600 ring-cyan-100",
};

const trendStyles: Record<Trend, string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  neutral: "text-slate-500 bg-slate-100",
};

export default function StatCard({
  title,
  value,
  subtitle,
  trend = "neutral",
  trendLabel,
  icon,
  accent = "blue",
}: StatCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 opacity-60 transition-transform group-hover:scale-110" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          <div className="flex flex-wrap items-center gap-2">
            {trendLabel && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${trendStyles[trend]}`}
              >
                {trend === "up" && "↑ "}
                {trend === "down" && "↓ "}
                {trendLabel}
              </span>
            )}
            <span className="text-xs text-slate-400">{subtitle}</span>
          </div>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${accentStyles[accent]}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}
