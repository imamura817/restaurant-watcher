import { chromium } from "playwright";
import nodemailer from "nodemailer";

const URL =
"https://reserve.tokyodisneyresort.jp/restaurant/search/";

async function sendMail(){

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

至急確認してください`

 });

 console.log("mail sent");

}

async function check(){

 const browser =
 await chromium.launch({

   headless:true,

   args:[
    "--no-sandbox",
    "--disable-dev-shm-usage"
   ]

 });

 const page =
 await browser.newPage({

   viewport:{
    width:1366,
    height:768
   }

 });

 try{

   console.log("opening");

   await page.goto(
    URL,
    {
      waitUntil:"commit",
      timeout:180000
    }
   );

   console.log("opened");

   await page.waitForTimeout(
    10000
   );

   console.log(
    "title:",
    await page.title()
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

   // 昼食

   await page
   .getByLabel("昼食")
   .check()
   .catch(()=>{});

   // レストラン

   await page.selectOption(
    'select',
    {
      label:"シェフ・ミッキー"
    }
   );

   console.log(
    "search click"
   );

   await page
   .getByText(
    "検索する"
   )
   .click();

   await page.waitForTimeout(
    15000
   );

   const reserveCount =
   await page.locator(
    "text=予約する"
   ).count();

   console.log(
    "reserve count:",
    reserveCount
   );

   if(
    reserveCount>0
   ){

     console.log(
      "available"
     );

     await sendMail();

   }else{

     console.log(
      "not available"
     );

   }

 }catch(e){

   console.error(
    "ERROR:",
    e.message
   );

   process.exit(1);

 }finally{

   await browser.close();

 }

}

check();
