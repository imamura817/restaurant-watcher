import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL = "https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function check() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });

    // 少し待ってUI安定
    await page.waitForTimeout(3000);

    // =========================
    // ① 日付（6/28）
    // =========================
    await page.click('text=日付');
    await page.click('text=28'); // 6月28日想定

    // =========================
    // ② 人数（3人）
    // =========================
    await page.click('text=人数');
    await page.click('text=3');

    // =========================
    // ③ ランチ
    // =========================
    await page.click('text=ランチ');

    // =========================
    // ④ レストラン選択
    // =========================
    await page.click('text=レストランを選ぶ');

    // シェフ・ミッキー選択
    await page.waitForTimeout(2000);
    await page.click('text=シェフ・ミッキー');

    // =========================
    // ⑤ 検索結果待ち
    // =========================
    await page.waitForTimeout(5000);

    const content = await page.content();

    console.log("チェック完了");

    if (content.includes("予約する")) {
      console.log("空きあり！メール送信");
      await sendMail();
    } else {
      console.log("空きなし");
    }

  } catch (err) {
    console.error("エラー:", err);
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
    subject: "【シェフ・ミッキー】6/28空き発見",
    text: "6月28日・3名・ランチに空きが出ました"
  });

  console.log("メール送信完了");
}

check();
