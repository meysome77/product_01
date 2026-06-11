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
        <div className="flex items-center gap-6">
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
          <a
            href="tel:0312345678"
            aria-label="電話をかける"
            className={`flex items-center gap-1.5 text-sm tracking-wider transition-colors hover:text-[#C8A96E] ${
              scrolled ? "text-[#1A1A1A]" : "text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden sm:inline">03-1234-5678</span>
          </a>
        </div>
      </div>
    </header>
  );
}
