import { Request, Response } from "express";
import { sendOtpOnMail } from "../modules/sendOtp";
import { msgtype } from "../types";
import { emptyRequestBody } from "../modules/emptyRequestBody";

export const sendMail= async (req:Request, res:Response)=>{
    const {email} = req.body;
    console.log("email", email)
const msg:msgtype = {
  to: email,
  from: 'rajneesh@solulab.com', // Use the email address or domain you verified above
  subject: 'Sending with Twilio SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js'
};

  await sendOtpOnMail(msg)

console.log("i am here dude...")
}
