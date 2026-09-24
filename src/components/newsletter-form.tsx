"use client";

import { useState } from "react";

export function NewsletterForm({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor="newsletter-email" className="block text-sm text-on-surface-variant">
        E-posta adresi
      </label>
      <div className="mt-2 flex gap-3">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="ornek@eposta.com"
          className="flex-1 rounded-sm border border-outline-variant bg-surface-high px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-sm bg-primary px-5 py-2 text-sm font-medium text-on-primary transition-transform duration-150 active:translate-y-px disabled:opacity-50"
        >
          Katıl
        </button>
      </div>
      {status === "success" && (
        <p className="mt-2 text-sm text-primary">Teşekkürler, kaydınız alındı.</p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-primary">
          Bir hata oluştu, lütfen tekrar deneyin.
        </p>
      )}
    </form>
  );
}
