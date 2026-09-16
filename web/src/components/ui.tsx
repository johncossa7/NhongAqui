import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-brand-600 text-white shadow-glow hover:bg-brand-700",
    secondary: "bg-white text-accent-ink ring-1 ring-gray-950/12 hover:bg-brand-50 hover:ring-brand-600",
    ghost: "text-gray-700 hover:bg-brand-50 hover:text-brand-700",
    danger: "bg-accent-red text-white shadow-[0_10px_20px_rgba(229,57,53,0.18)] hover:bg-red-700"
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-black transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-accent-ink outline-none ring-brand-500 transition placeholder:text-gray-400 focus:border-brand-600 focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-accent-ink outline-none ring-brand-500 transition focus:border-brand-600 focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-accent-ink outline-none ring-brand-500 transition placeholder:text-gray-400 focus:border-brand-600 focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <article className={`rounded-2xl border border-gray-200/80 bg-white ${className}`}>
      {children}
    </article>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/90 p-8 text-center shadow-soft">
      <h3 className="text-base font-semibold text-gray-950">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{text}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-4/5 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
    </div>
  );
}
