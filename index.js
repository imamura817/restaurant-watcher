import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL = "https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function check() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });

    // 1. 日付選択
    await page.click('selector-for-2026-06-28'); // ← 実際のカレンダーのボタンセレクタに置き換える

    // 2. 人数選択（3人）
    await page.selectOption('selector-for-number-of-people', '3'); // ← ドロップダウンのセレクタ

    // 3. 昼食/時間帯選択
    await page.click('selector-for-lunch'); // ← ランチのラジオボタンなど

    // ページ更新待ち
    await page.waitForTimeout(2000); // 2秒待つ

    const content = await page.content();
    console.log("チェック完了");

    if (content.includes("予約する")) {
      console.log("空きあり！メール送信します");
      await sendMail();
    } else {
      console.log("空きなし");
    }
  } catch (err) {
    console.error("ページ操作中にエラー:", err);
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
    to: process.env.GMAIL_USER,
    subject: "【シェフ・ミッキー】空き発見",
    text: "予約ページを確認してください\n" + URL
  });

  console.log("メール送信完了");
}

check();
