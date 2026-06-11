"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "メニュー", href: "#menu" },
  { label: "アクセス", href: "#access" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="#top"
          className={`text-xl font-light tracking-widest transition-colors ${
            scrolled ? "text-[#1A1A1A]" : "text-white"
          }`}
        >
          Café Lumière
        </a>
        <nav aria-label="メインナビゲーション">
          <ul className="flex gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className={`text-sm tracking-widest transition-colors hover:text-[#C8A96E] ${
                    scrolled ? "text-[#1A1A1A]" : "text-white"
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
