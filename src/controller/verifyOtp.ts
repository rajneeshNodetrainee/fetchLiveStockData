import {Request ,Response } from "express";
import validator from "validator";
import { Otp } from "../database_models/otp";
import { User } from "../database_models/user";
import jwt, { JwtPayload } from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { emptyRequestBody } from "../modules/emptyRequestBody";

export const verifyOtp = async (req:Request, res:Response)=>{
    if(emptyRequestBody(req)){
        return res.status(400).json({error: "Nothing in the body"})
    }
    const {otp,email} = req.body;
    if(!otp || !email){
        return res.status(404).json({error: "Provide otp and email"})
    }

    const findUser = await User.findOne({email:email})
    
    if(!findUser){
        return res.status(404).json({error:"User has not been registered"})
    }
    // console.log(_id)
    const otpDetail = await Otp.findOne({userId: findUser._id});

    if(!otpDetail){
        return res.status(401).json({error: "Request an otp first "})
    }
    // console.log(otpDetail)
    const otpTimestamp = otpDetail.generatedAt as number ;
    console.log(otpTimestamp)

    if(otp.toString().length!==5){
            return res.status(401).json({error:"Enter an otp of length 5"})
        }
    
    if(Date.now()-otpTimestamp > 300*1000){
            return res.status(401).json({error: "OTP has expired."})
        }

    if(otpDetail.isVerified){
        return res.status(226).json({error: "OTP has expired"})
    }
    
    const isMatch = await bcrypt.compare(otp.toString(), otpDetail.otp)
    // console.log(isMatch)
    if(isMatch){
        // const token = req.headers.authorization?.split(' ')[1];
        // const verifyToken = jwt.verify(token!, process.env.SECRET_KEY!) as JwtPayload

        // console.log("verifyToken", verifyToken)

        // let userId;  //it will be updated in OTP document.

        // const {name, email, password, phone} = verifyToken;

        // const user = new User({
        //     name:name,
        //     email:email,
        //     password:password,
        //     phone:phone
        //     })
        //     console.log("user", user)
        //     await user.save();
        //     userId = user._id;

    // await otpDetail.updateOne({_id}, {$set:{userId: user._id}});

        const newToken = jwt.sign({id: findUser._id},
                        process.env.SECRET_KEY as string,
                        {expiresIn:'48h'}
                        )

        res.cookie("jwt", newToken)   

        console.log("verified token",newToken)
        // update the document
        const _id = findUser._id
        await User.findOneAndUpdate({_id}, {isVerified:true});
        await Otp.findOneAndUpdate({userId:_id}, {isVerified:true});
        
        return res.status(201).json({message: "User Authenticated..."})
        
    }else{
        return res.status(401).json({error: "Invalid otp"})
    }
}

