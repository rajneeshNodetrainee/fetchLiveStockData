import mongoose ,{Types} from "mongoose";
import {otpDocument} from "../types"

const otpSchema = new mongoose.Schema({
    userId:{
        type:Types.ObjectId,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    generatedAt:{
        type:Number,
        required:true
    }
})


export const Otp = mongoose.model<otpDocument>('Otp',otpSchema)