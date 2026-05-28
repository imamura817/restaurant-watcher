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

   subject:"【シェフミッキー】空き発見",

   text:"シェフミッキー昼食に空きあり"

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

   console.log("opening");

   await page.goto(
    URL,
    {
      waitUntil:"domcontentloaded",
      timeout:120000
    }
   );

   console.log("opened");

   await page.waitForTimeout(
    5000
   );

   await page.fill(
    'input[name="useDate"]',
    "2026/06/28"
   );

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

   await page
   .getByLabel("昼食")
   .check()
   .catch(()=>{});

   await page.selectOption(
    'select',
    {
      label:"シェフ・ミッキー"
    }
   );

   await page
   .getByText("検索する")
   .click();

   await page.waitForTimeout(
    10000
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

     await sendMail();

   }

 }catch(e){

   console.log(
    "ERROR:",
    e.message
   );

 }finally{

   await browser.close();

 }

}

check();
