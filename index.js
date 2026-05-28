import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL = "https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function check() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const content = await page.content();

  console.log("チェック完了");

  if (content.includes("予約する")) {
    await sendMail();
  }

  await browser.close();
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
}

check();
