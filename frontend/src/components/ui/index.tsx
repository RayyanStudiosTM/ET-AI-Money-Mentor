import React from "react";
import { clsx } from "clsx";

// ── Button ─────────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}
export const Button: React.FC<BtnProps> = ({
  variant = "primary", size = "md", loading, icon, children, className, disabled, ...rest
}) => {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark active:scale-[0.98]",
    secondary: "bg-white border border-[#e8e8e8] text-[#404040] hover:border-[#b0b0b0] hover:bg-[#fafafa]",
    ghost: "bg-transparent text-[#404040] hover:bg-[#f5f5f5]",
    danger: "bg-white border border-[#e8e8e8] text-[#dc2626] hover:border-[#dc2626] hover:bg-[#fef2f2]",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...rest}>
      {loading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ── Input ──────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; prefix?: string; suffix?: string; error?: string; hint?: string;
}
export const Input: React.FC<InputProps> = ({ label, prefix, suffix, error, hint, className, ...rest }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-[#404040]">{label}</label>}
    <div className="relative flex items-center">
      {prefix && <span className="absolute left-3 text-xs text-[#8c8c8c] pointer-events-none font-mono">{prefix}</span>}
      <input
        className={clsx(
          "w-full bg-white border rounded-lg text-sm text-[#1a1a1a] placeholder:text-[#b0b0b0]",
          "px-3 py-2 outline-none transition-colors",
          "focus:border-brand focus:ring-1 focus:ring-brand/20",
          error ? "border-[#dc2626]" : "border-[#e8e8e8] hover:border-[#b0b0b0]",
          prefix && "pl-7", suffix && "pr-8",
          className
        )}
        {...rest}
      />
      {suffix && <span className="absolute right-3 text-xs text-[#8c8c8c] pointer-events-none">{suffix}</span>}
    </div>
    {error && <p className="text-xs text-[#dc2626]">{error}</p>}
    {hint && !error && <p className="text-xs text-[#8c8c8c]">{hint}</p>}
  </div>
);

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; options: { value: string; label: string }[];
}
export const Select: React.FC<SelectProps> = ({ label, options, className, ...rest }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-xs font-medium text-[#404040]">{label}</label>}
    <select
      className={clsx(
        "w-full bg-white border border-[#e8e8e8] rounded-lg text-sm text-[#1a1a1a]",
        "px-3 py-2 outline-none transition-colors cursor-pointer",
        "hover:border-[#b0b0b0] focus:border-brand focus:ring-1 focus:ring-brand/20",
        className
      )}
      {...rest}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// ── Card ───────────────────────────────────────────────────────────────────────
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean; accent?: string; padding?: string;
}
export const Card: React.FC<CardProps> = ({ hover, accent, padding = "p-5", children, className, ...rest }) => (
  <div
    className={clsx(
      "bg-white border border-[#e8e8e8] rounded-xl",
      hover && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-200",
      !hover && "shadow-card",
      padding, className
    )}
    style={accent ? { borderTop: `2px solid ${accent}` } : undefined}
    {...rest}
  >
    {children}
  </div>
);

// ── Stat box ──────────────────────────────────────────────────────────────────
export const Stat: React.FC<{
  label: string; value: string; sub?: string; color?: string; icon?: React.ReactNode;
}> = ({ label, value, sub, color = "#1a56db", icon }) => (
  <div className="bg-white border border-[#e8e8e8] rounded-xl p-4">
    {icon && <div className="mb-2 text-[#8c8c8c]">{icon}</div>}
    <div className="text-xl font-display" style={{ color }}>{value}</div>
    <div className="text-xs text-[#8c8c8c] mt-0.5">{label}</div>
    {sub && <div className="text-xs mt-0.5 font-medium" style={{ color }}>{sub}</div>}
  </div>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeColor = "blue" | "green" | "amber" | "red" | "gray" | "purple";
export const Badge: React.FC<{ label: string; color?: BadgeColor }> = ({ label, color = "blue" }) => {
  const styles: Record<BadgeColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return <span className={clsx("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border", styles[color])}>{label}</span>;
};

// ── Alert ─────────────────────────────────────────────────────────────────────
type AlertType = "info" | "success" | "warning" | "error";
export const Alert: React.FC<{ type?: AlertType; title?: string; children: React.ReactNode }> = ({
  type = "info", title, children
}) => {
  const styles: Record<AlertType, string> = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={clsx("rounded-lg border p-3 text-sm", styles[type])}>
      {title && <p className="font-medium mb-0.5">{title}</p>}
      <p className="leading-relaxed opacity-90">{children}</p>
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{
  value: number; color?: string; label?: string; showValue?: boolean;
}> = ({ value, color = "#1a56db", label, showValue }) => (
  <div>
    {(label || showValue) && (
      <div className="flex justify-between items-center mb-1">
        {label && <span className="text-xs text-[#8c8c8c]">{label}</span>}
        {showValue && <span className="text-xs font-medium" style={{ color }}>{value}%</span>}
      </div>
    )}
    <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  </div>
);

// ── Section header ────────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{
  title: string; subtitle?: string; action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-lg font-display text-[#1a1a1a]">{title}</h2>
      {subtitle && <p className="text-sm text-[#8c8c8c] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={clsx("border-[#e8e8e8]", className)} />
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <div
    className={clsx("border-2 border-[#e8e8e8] border-t-brand rounded-full animate-spin", className)}
    style={{ width: size, height: size }}
  />
);

// ── Empty state ───────────────────────────────────────────────────────────────
export const EmptyState: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({
  title, subtitle, action
}) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4">
      <div className="w-6 h-6 bg-[#d4d4d4] rounded-sm" />
    </div>
    <p className="text-sm font-medium text-[#2a2a2a] mb-1">{title}</p>
    {subtitle && <p className="text-xs text-[#8c8c8c] max-w-xs">{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
