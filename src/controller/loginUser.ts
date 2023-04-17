import {Request,Response} from "express"
import {User} from "../database_models/user.ts"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { Otp } from "../database_models/otp.ts"
import { emptyRequestBody } from "../modules/emptyRequestBody.ts"
import { sendOtpOnWhatsapp } from "../modules/sendOtp.ts"

// let otp:number;
// let otpTimestamp:number;

export const loginUser = async(req:Request, res:Response):Promise<(Response | undefined)> =>{
	
	try{	
		if(emptyRequestBody(req)){
			return res.status(404).json({error: "Nothing found"})
		}

	const {email, password} = req.body;

	const foundUser = await User.findOne({email:email})
	
	if(!foundUser){
	return res.status(404).json({error: "There is no user with this credentials"})
	}
	
	const isMatch = await bcrypt.compare(password, foundUser.password)
	if(!isMatch){
	return res.status(401).json({error: "Invalid credentials"})
	}

	const otp = await sendOtpOnWhatsapp();
	const receivedOtp = otp.otp.toString(); //converting into string cuz bcrypt.hash takes string

	console.log("otp", otp)
	// console.log("otp.otp", otp.otp);
	// console.log("otp.otptimestamp", otp.otpTimestamp);

	const hashedOtp = await bcrypt.hash(receivedOtp, 10)
	console.log("hashedotp", hashedOtp)
	
	const saveotp = new Otp({
        userId:null,
        otp:hashedOtp,
        generatedAt:otp.otpTimestamp
    })

    await saveotp.save();

	const loginToken = jwt.sign({
							email:email,
							id:foundUser._id,
							path:'login'
						},
						process.env.SECRET_KEY as string,
						{expiresIn:'6h'})
	console.log("login Token", loginToken)
	res.cookie("loginToken", loginToken)

	return res.status(202).json({message: "OTP has been send to your number"})

	}catch(err:any){
	return res.status(404).json({error: err.message})
	}
}

