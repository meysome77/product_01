export default function Hero() {
  return (
    <section
      id="top"
      className="relative h-screen flex items-center justify-center overflow-hidden"
      aria-label="ヒーローセクション"
    >
      {/* 背景 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#2C1810] via-[#4A3728] to-[#1A1209]"
        aria-hidden="true"
      />
      {/* オーバーレイパターン */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 50%, #C8A96E 0%, transparent 50%), radial-gradient(circle at 75% 20%, #C8A96E 0%, transparent 40%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center px-6">
        <p className="text-[#C8A96E] text-sm tracking-[0.4em] mb-6 uppercase">
          Since 2018
        </p>
        <h1 className="text-white text-5xl md:text-7xl font-light tracking-widest mb-4">
          Café Lumière
        </h1>
        <p className="text-white/70 text-lg md:text-xl font-light tracking-wider mb-12">
          静かな時間を、あなたに
        </p>
        <a
          href="#menu"
          className="inline-block border border-[#C8A96E] text-[#C8A96E] px-10 py-3 text-sm tracking-widest hover:bg-[#C8A96E] hover:text-white transition-colors duration-300"
        >
          MENU
        </a>
      </div>

      {/* スクロールインジケーター */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-white/40 text-xs tracking-widest">SCROLL</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
