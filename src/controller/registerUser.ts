import {Request, Response} from "express"
import validator from "validator"
import {User} from "../database_models/user"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { sendOtpOnWhatsapp } from "../modules/sendOtp"
import { Otp } from "../database_models/otp"
import { emptyRequestBody } from "../modules/emptyRequestBody"

export const registerUser = async(req:Request, res:Response):Promise<Response> =>{
	
	try{

	// const result = req.body;
	
	if(emptyRequestBody(req)){
	return res.status(400).json({error: "Nothing found"})
	}

	const {name,phone,email,password} = req.body;

	if(!name){
	return res.status(400).json({error: "name is required"})
	}

	if(!email){
	return res.status(400).json({error: "email is required"})
	}

	if(!validator.isEmail(email)){
		return res.status(400).json({error: "Invalid email"})
		}
	
	const userFound = await User.findOne({email:email})

	if(userFound){
	return res.status(409).json({error: "Someone is using this email id"})
	}

	if(!password){
	return res.status(400).json({error: "password is required"})
	}

	if(password.length<8){
		return res.status(401).json({error: "Password must be of atleat 8 characters"})
	}

	if(!phone){
	return res.status(400).json({error: "phone is required"})
	}

	if(phone.toString().length!=10){
		return res.status(400).json({error:"Invalid phone number"})
		}	

	const hashedPassword = await bcrypt.hash(password,10);

	const user = new User({
					name:name,
					email:email,
					password:hashedPassword,
					phone:phone
					})
			await user.save();

	const foundUser = await User.findOne({email:email})
	// console.log(foundUser)

	const otp =await sendOtpOnWhatsapp();
	const receivedOtp = otp.otp.toString(); //converting into string cuz bcrypt.hash takes string

	console.log("otp", otp)
	// console.log("otp.otp", otp.otp);
	// console.log("otp.otptimestamp", otp.otpTimestamp);

	const hashedOtp = await bcrypt.hash(receivedOtp, 10)
	console.log("hashedOtp", hashedOtp)
	
	//find if user has generated an otp before and has not verified then update the otp
	// const foundUserInOtpCollection = await Otp.findOne({userId:foundUser?._id})
	// if(foundUserInOtpCollection){
	// 	await foundUserInOtpCollection.updateOne({userId:foundUser?._id}, {$set:{otp:hashedOtp}})
        
	// }
	
	const saveotp = new Otp({
		userId:foundUser?._id,
		otp:hashedOtp,
		generatedAt:otp.otpTimestamp
	})
			 
	await saveotp.save();
	// console.log("otpId", saveotp._id)

	// const registrationToken = jwt.sign({
	// 						name:name, email:email, password:hashedPassword,phone:phone,path:'register'
	// 					},
	// 					process.env.SECRET_KEY as string,
	// 					{expiresIn:'2h'})
	// console.log("registrationToken", registrationToken)
	// res.cookie("resToken", registrationToken)

	return res.status(202).json({message: "Please verify your otp"})

	}catch(e:any){
	return res.status(404).json({error: e.message})
	}
}
