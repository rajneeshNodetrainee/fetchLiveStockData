import {Response} from "express"
import {Request} from "express"
import { Stock } from "../database_models/stocks"
// import { sendOtpOnMail } from "../modules/sendOtp";

export const get = async( req:Request, res:Response)=>{
	// sendOtpOnMail()
	// res.sendStatus(200);
	const allStock = await Stock.find();
	// console.log(allStock.length)
	for(let i=0;i<allStock.length; i++){
		console.log(allStock[i].symbol)
	}
	res.send(allStock)
	// res.status(200).json({message: "You have reached here"})
}
