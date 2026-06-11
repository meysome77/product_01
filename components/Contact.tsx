"use client";

import { useActionState } from "react";
import { sendContactEmail, type ContactState } from "@/app/actions/contact";

const initialState: ContactState = { status: "idle" };

const inputClass =
  "w-full border border-[#E8E0D5] bg-white px-4 py-3 text-sm text-[#1A1A1A] placeholder-[#BDBDBD] focus:outline-none focus:border-[#C8A96E] transition-colors";

export default function Contact() {
  const [state, action, isPending] = useActionState(sendContactEmail, initialState);

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C8A96E] text-xs tracking-[0.4em] uppercase mb-3">Reservation</p>
          <h2 className="text-3xl font-light tracking-widest text-[#1A1A1A]">予約・お問い合わせ</h2>
          <p className="text-[#6B6B6B] text-sm mt-4 leading-relaxed">
            ご予約やお問い合わせは下記フォームよりお気軽にどうぞ。
            <br />
            通常2営業日以内にご返信いたします。
          </p>
        </div>

        {state.status === "success" ? (
          <div className="text-center py-16 border border-[#C8A96E]">
            <p className="text-[#C8A96E] text-lg tracking-wider mb-2">ありがとうございます</p>
            <p className="text-[#6B6B6B] text-sm">お送りいただいた内容を確認の上、ご連絡いたします。</p>
          </div>
        ) : (
          <form action={action} aria-label="予約・お問い合わせフォーム">
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-xs tracking-widest text-[#6B6B6B] uppercase mb-2">
                  お名前 <span className="text-[#C8A96E]">*</span>
                </label>
                <input id="name" name="name" type="text" required placeholder="山田 花子" className={inputClass} />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs tracking-widest text-[#6B6B6B] uppercase mb-2">
                  メールアドレス <span className="text-[#C8A96E]">*</span>
                </label>
                <input id="email" name="email" type="email" required placeholder="email@example.com" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-xs tracking-widest text-[#6B6B6B] uppercase mb-2">
                    ご希望日
                  </label>
                  <input id="date" name="date" type="date" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="guests" className="block text-xs tracking-widest text-[#6B6B6B] uppercase mb-2">
                    人数
                  </label>
                  <select id="guests" name="guests" className={inputClass}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n}名</option>
                    ))}
                    <option value="7+">7名以上</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs tracking-widest text-[#6B6B6B] uppercase mb-2">
                  メッセージ
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="ご要望・ご質問をご記入ください"
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            {state.status === "error" && (
              <p role="alert" className="text-red-500 text-sm mt-4">
                {state.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-8 w-full bg-[#C8A96E] text-white py-4 text-sm tracking-widest hover:bg-[#B8955A] transition-colors duration-300 disabled:opacity-50"
            >
              {isPending ? "送信中..." : "送信する"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
