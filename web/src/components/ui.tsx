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
    primary: "bg-gray-950 text-white shadow-[0_14px_30px_rgba(17,24,39,0.24)] hover:bg-brand-700",
    secondary: "bg-white text-gray-950 ring-1 ring-gray-950/15 hover:ring-gray-950",
    ghost: "text-gray-700 hover:bg-white/80",
    danger: "bg-red-600 text-white shadow-[0_10px_20px_rgba(220,38,38,0.18)] hover:bg-red-700"
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2 text-sm font-bold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none ring-brand-500 transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none ring-brand-500 transition focus:border-gray-950 focus:ring-1 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 outline-none ring-brand-500 transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-1 ${className}`}
      {...props}
    />
  );
}

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return (
    <article className={`rounded-lg border border-gray-200 bg-white ${className}`}>
      {children}
    </article>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="border border-dashed border-gray-300 bg-white/90 p-8 text-center">
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
