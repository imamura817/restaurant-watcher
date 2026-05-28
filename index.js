import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL =
"https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function sendMail() {

 const transporter =
  nodemailer.createTransport({

   service:"gmail",

   auth:{
     user:process.env.GMAIL_USER,
     pass:process.env.GMAIL_PASS
   }

 });

 await transporter.sendMail({

   from:process.env.GMAIL_USER,

   to:process.env.GMAIL_USER,

   subject:"【シェフ・ミッキー】空き発見",

   text:
`シェフ・ミッキーに空きが出ました

日付:2026/06/28
人数:大人2 子供1(8歳)
時間帯:昼食

すぐ確認してください`

 });

 console.log("mail sent");

}

async function check(){

 const browser =
 await chromium.launch({

   headless:true,

   args:["--no-sandbox"]

 });

 const page =
 await browser.newPage();

 try{

   console.log("open");

   await page.goto(
     URL,
     {
      waitUntil:"networkidle",
      timeout:60000
     }
   );

   await page.waitForTimeout(
     3000
   );

   // 日付

   await page.fill(
     'input[name="useDate"]',
     "2026/06/28"
   );

   // 人数

   await page.selectOption(
     'select[name="adultNum"]',
     "2"
   );

   await page.selectOption(
     'select[name="childNum"]',
     "1"
   );

   await page.selectOption(
     'select[name="childAgeInform"]',
     "08"
   );

   // 朝食/夕食OFF

   await page
   .getByLabel("朝食")
   .uncheck()
   .catch(()=>{});

   await page
   .getByLabel("夕食")
   .uncheck()
   .catch(()=>{});

   // 昼食ON

   await page
   .getByLabel("昼食")
   .check();

   // レストラン

   await page.selectOption(
    'select',
    {
      label:"シェフ・ミッキー"
    }
   );

   // 検索

   await page
   .getByText("検索する")
   .click();

   await page.waitForLoadState(
     "networkidle"
   );

   await page.waitForTimeout(
     3000
   );

   const reserveCount =
   await page
   .locator(
     "text=予約する"
   )
   .count();

   console.log(
    "reserve count",
    reserveCount
   );

   if(
    reserveCount>0
   ){

     console.log(
      "available!"
     );

     await sendMail();

   }else{

     console.log(
      "not available"
     );

   }

 }catch(err){

   console.error(err);

 }finally{

   await browser.close();

 }

}

check();
