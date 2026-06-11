export default function Footer() {
  return (
    <footer className="bg-[#1A1209] text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-white text-xl font-light tracking-widest mb-2">Café Lumière</p>
        <p className="text-xs tracking-widest mb-8">〒150-0001 東京都渋谷区神宮前1-2-3</p>

        <nav aria-label="SNSリンク" className="flex justify-center gap-8 mb-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest hover:text-[#C8A96E] transition-colors"
            aria-label="Instagram（外部リンク）"
          >
            Instagram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs tracking-widest hover:text-[#C8A96E] transition-colors"
            aria-label="X (Twitter)（外部リンク）"
          >
            X (Twitter)
          </a>
        </nav>

        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Café Lumière. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
