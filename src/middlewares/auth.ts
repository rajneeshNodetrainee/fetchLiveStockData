import {Response,NextFunction} from "express"
import { Request } from "../types"
import jwt, { JwtPayload } from "jsonwebtoken"
import {User} from "../database_models/user"

export const auth = async(req:Request, res:Response, next:NextFunction)=>{
	try{
	// console.log("reached in auth function")
	const authHeader = req.headers.authorization
		// console.log(authHeader)
	if(typeof authHeader==='string'){

	const token = authHeader.split(' ')[1];

	// console.log("token2", token)

	const verifyUser = jwt.verify(token, process.env.SECRET_KEY!) as JwtPayload
	console.log("verifyUser", verifyUser)
	// if(!verifyUser.isAuthenticated || typeof verifyUser.isAuthenticated=='undefined'){
	// 	return res.status(401).json({error: "Please verify your otp"})
	// }

	const user = await User.findOne({_id:verifyUser.id})

	if(!user){
		return res.status(404).json({error: "User doesn't exist"})
	}
	if(!user.isVerified){
		return res.status(401).json({error: "Please verify your otp"})
	}

	console.log("user",user)

	req.token = token;
	req.user = user

	}else{
		return res.status(401).json({error: "Invalid token"})
	}
	
	next();

	}catch(e:any){
	return res.status(404).json({error: "Please log in to be authorised "})
	}
}

