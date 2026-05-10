import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "destructive";
  subtitle?: string;
  alert?: boolean;
}

const variantStyles: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

/** Parses a numeric prefix from "1 234 FCFA" -> 1234, returns null if not numeric */
function extractNumber(v: string | number): { num: number; suffix: string } | null {
  if (typeof v === "number") return { num: v, suffix: "" };
  const m = String(v).match(/^([\d\s.,]+)(.*)$/);
  if (!m) return null;
  const n = Number(m[1].replace(/[\s,]/g, ""));
  if (!isFinite(n)) return null;
  return { num: n, suffix: m[2] };
}

function formatLike(original: string | number, current: number, suffix: string): string {
  if (typeof original === "number") return String(Math.round(current));
  // Preserve thousand separators (spaces)
  const rounded = Math.round(current);
  const withSep = rounded.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
  return withSep + suffix;
}

function useCountUp(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = val;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(fromRef.current + (target - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

export function KpiCard({ title, value, icon: Icon, variant = "primary", subtitle, alert }: Props) {
  const parsed = extractNumber(value);
  const animated = useCountUp(parsed?.num ?? 0);
  const display = parsed ? formatLike(value, animated, parsed.suffix) : String(value);

  // Tilt
  const cardRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateZ(0)`;
  };
  const onLeave = () => {
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0) rotateY(0)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="transition-transform duration-200 will-change-transform"
    >
      <Card
        className={cn(
          "p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow animate-fade-in relative overflow-hidden",
          alert && "border-destructive/40 animate-heartbeat",
        )}
      >
        <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-current opacity-[0.04] blur-2xl" />
        <div className="flex items-start justify-between gap-3 relative">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2 text-foreground truncate tabular-nums">{display}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110 hover:rotate-3", variantStyles[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
}
