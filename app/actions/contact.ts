"use server";

import { Resend } from "resend";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const date = formData.get("date")?.toString() ?? "";
  const guests = formData.get("guests")?.toString() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!name || !email) {
    return { status: "error", message: "お名前とメールアドレスは必須です。" };
  }

  const toEmail = process.env.CONTACT_EMAIL;
  if (!toEmail) {
    console.error("CONTACT_EMAIL is not set");
    return { status: "error", message: "サーバーの設定エラーが発生しました。" };
  }

  const { error } = await resend.emails.send({
    from: "Café Lumière <onboarding@resend.dev>",
    to: toEmail,
    replyTo: email,
    subject: `【お問い合わせ】${name} 様より`,
    text: [
      `お名前: ${name}`,
      `メールアドレス: ${email}`,
      `ご希望日: ${date || "未記入"}`,
      `人数: ${guests}名`,
      ``,
      `メッセージ:`,
      message || "（なし）",
    ].join("\n"),
  });

  if (error) {
    console.error("Resend error:", error);
    return { status: "error", message: "送信に失敗しました。しばらく経ってから再度お試しください。" };
  }

  return { status: "success" };
}
