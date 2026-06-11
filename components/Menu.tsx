"use client";

import { useState } from "react";

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: string;
};

const DRINKS: MenuItem[] = [
  { id: 1, name: "ハンドドリップコーヒー", description: "厳選した豆を丁寧にドリップ。深みのある香りと余韻。", price: "¥650" },
  { id: 2, name: "カフェラテ", description: "エスプレッソと滑らかなミルクフォームの一杯。", price: "¥720" },
  { id: 3, name: "カモミールティー", description: "有機栽培のカモミールを使用した、穏やかな風味。", price: "¥650" },
  { id: 4, name: "自家製レモネード", description: "国産レモンをたっぷり使った爽やかなドリンク。", price: "¥700" },
  { id: 5, name: "抹茶ラテ", description: "京都産宇治抹茶とオートミルクの組み合わせ。", price: "¥750" },
  { id: 6, name: "季節のフルーツソーダ", description: "旬のフルーツを使ったオリジナルソーダ。", price: "¥720" },
];

const FOODS: MenuItem[] = [
  { id: 101, name: "バスクチーズケーキ", description: "外はこんがり、中はとろける濃厚なチーズケーキ。", price: "¥680" },
  { id: 102, name: "クロワッサン", description: "毎朝焼き上げるサクサクのバタークロワッサン。", price: "¥380" },
  { id: 103, name: "アボカドトースト", description: "厚切りパンに完熟アボカドとポーチドエッグ。", price: "¥980" },
  { id: 104, name: "キッシュ（日替わり）", description: "旬の野菜をたっぷり使った自家製キッシュ。", price: "¥850" },
];

function MenuCard({ item }: { item: MenuItem }) {
  return (
    <div className="border border-[#E8E0D5] p-6 hover:border-[#C8A96E] transition-colors duration-300 group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-[#1A1A1A] font-medium group-hover:text-[#C8A96E] transition-colors">
          {item.name}
        </h3>
        <span className="text-[#C8A96E] font-light ml-4 shrink-0">{item.price}</span>
      </div>
      <p className="text-[#6B6B6B] text-sm leading-relaxed">{item.description}</p>
    </div>
  );
}

export default function Menu() {
  const [activeTab, setActiveTab] = useState<"drinks" | "foods">("drinks");
  const items = activeTab === "drinks" ? DRINKS : FOODS;

  return (
    <section id="menu" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A96E] text-xs tracking-[0.4em] uppercase mb-3">Menu</p>
          <h2 className="text-3xl font-light tracking-widest text-[#1A1A1A]">メニュー</h2>
        </div>

        {/* タブ */}
        <div className="flex justify-center mb-12" role="tablist" aria-label="メニューカテゴリ">
          {(["drinks", "foods"] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-3 text-sm tracking-widest border transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-[#C8A96E] text-white border-[#C8A96E]"
                  : "bg-white text-[#6B6B6B] border-[#E8E0D5] hover:border-[#C8A96E]"
              }`}
            >
              {tab === "drinks" ? "DRINKS" : "FOOD"}
            </button>
          ))}
        </div>

        <div
          id={`${activeTab}-panel`}
          role="tabpanel"
          aria-label={activeTab === "drinks" ? "ドリンクメニュー" : "フードメニュー"}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        <p className="text-center text-[#6B6B6B] text-xs mt-10 tracking-wider">
          ※ 価格はすべて税込です。メニューは季節により変更する場合がございます。
        </p>
      </div>
    </section>
  );
}
