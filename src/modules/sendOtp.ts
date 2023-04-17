import twilio from "twilio"
// const sgMail = require('@sendgrid/mail');
import * as sgMail from "@sendgrid/mail"
import { msgtype } from "../types";

let otp:number;
let otpTimestamp:number;

export const sendOtpOnWhatsapp = async ()=>{
    const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)

    otp = Math.floor(Math.random()*90000)+10000
    client.messages
    .create({
        body: `Your otp is ${otp}`,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+917030138451'
    })
    .then((message:any) => {
        console.log(message.sid)
        console.log("otpTimestamp", otpTimestamp)
    })
    .catch((e:any)=>console.log(e))

    console.log("otp",otp)
    otpTimestamp = Date.now();

    return {otp, otpTimestamp};

}

export const sendOtpOnMail = async (msg:msgtype)=>{
    
    console.log("api key", process.env.SENDGRID_API_KEY as string )
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
    
    const sentMsg = await sgMail.send(msg)
    console.log("sentMsg", sentMsg)
    console.log("mail sent")
   
}

