const HOURS = [
  { day: "月曜日", time: "定休日" },
  { day: "火〜金曜日", time: "10:00 – 19:00" },
  { day: "土・日曜日", time: "09:00 – 20:00" },
  { day: "祝日", time: "10:00 – 18:00" },
];

export default function Access() {
  return (
    <section id="access" className="py-24 px-6 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A96E] text-xs tracking-[0.4em] uppercase mb-3">Access</p>
          <h2 className="text-3xl font-light tracking-widest text-[#1A1A1A]">アクセス・営業時間</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* 店舗情報 */}
          <div className="space-y-10">
            <div>
              <h3 className="text-xs tracking-[0.3em] text-[#C8A96E] uppercase mb-4">営業時間</h3>
              <dl className="space-y-3">
                {HOURS.map(({ day, time }) => (
                  <div key={day} className="flex justify-between border-b border-[#E8E0D5] pb-3">
                    <dt className="text-sm text-[#6B6B6B]">{day}</dt>
                    <dd
                      className={`text-sm ${
                        time === "定休日" ? "text-[#C8A96E]" : "text-[#1A1A1A]"
                      }`}
                    >
                      {time}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <h3 className="text-xs tracking-[0.3em] text-[#C8A96E] uppercase mb-4">店舗情報</h3>
              <address className="not-italic space-y-3 text-sm text-[#6B6B6B] leading-relaxed">
                <p>
                  <span className="text-[#1A1A1A] font-medium">住所</span>
                  <br />
                  〒150-0001 東京都渋谷区神宮前1-2-3
                  <br />
                  〇〇ビル 1F
                </p>
                <p>
                  <span className="text-[#1A1A1A] font-medium">電話番号</span>
                  <br />
                  <a
                    href="tel:0312345678"
                    className="hover:text-[#C8A96E] transition-colors"
                  >
                    03-1234-5678
                  </a>
                </p>
                <p>
                  <span className="text-[#1A1A1A] font-medium">最寄り駅</span>
                  <br />
                  東京メトロ原宿駅 徒歩3分
                </p>
              </address>
            </div>
          </div>

          {/* 地図 */}
          <div className="w-full h-80 lg:h-auto min-h-64">
            <iframe
              title="Café Lumière の地図"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.273485893848!2d139.70243!3d35.67161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ca6a5d4f5e7%3A0x0!2s!5e0!3m2!1sja!2sjp!4v1234567890"
              width="100%"
              height="100%"
              className="w-full h-full border-0 grayscale"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
