import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL = "https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function check() {
  // GitHub Actions向けに headless + no-sandbox
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    // 60秒タイムアウト & networkidleで読み込み完了を待つ
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });

    const content = await page.content();

    console.log("チェック完了");

    if (content.includes("予約する")) {
      console.log("空きあり！メール送信します");
      await sendMail();
    } else {
      console.log("空きなし");
    }
  } catch (err) {
    console.error("ページ読み込み中にエラーが発生:", err);
  } finally {
    await browser.close();
  }
}

async function sendMail() {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER, // 自分宛てに送信
    subject: "【シェフ・ミッキー】空き発見",
    text: "予約ページを確認してください\n" + URL
  });

  console.log("メール送信完了");
}

// 実行
check();
