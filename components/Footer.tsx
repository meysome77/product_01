export default function Footer() {
  return (
    <footer className="bg-[#1A1209] text-white/60 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-white text-xl font-light tracking-widest mb-2">Café Lumière</p>
        <p className="text-xs tracking-widest mb-8">〒150-0001 東京都渋谷区神宮前1-2-3</p>

        <div className="mb-8">
          <p className="text-white/50 text-xs tracking-widest mb-4">
            最新情報は Instagram でチェック
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram（外部リンク）"
            className="inline-block border border-[#C8A96E] text-[#C8A96E] px-8 py-2 text-xs tracking-widest hover:bg-[#C8A96E] hover:text-white transition-colors duration-300"
          >
            Instagram をフォロー
          </a>
        </div>

        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Café Lumière. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
