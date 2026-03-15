"use client";

import { useState } from "react";

interface CheckoutButtonProps {
  plan: "pro" | "cabinet";
  className?: string;
  children: React.ReactNode;
}

export default function CheckoutButton({ plan, className, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erreur lors de la redirection.");
        setLoading(false);
      }
    } catch {
      alert("Erreur réseau. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Redirection…" : children}
    </button>
  );
}
