import mongoose from "mongoose"
import { Iuser } from "../types";
// interface Iuser {
// 	name:string;
// 	email:string;
// 	password:string;
// 	phone:number;
// }

const userSchema = new mongoose.Schema<Iuser>({
	name:{
	type:String,
	required:true
	},

	email:{
	type:String,
	required:true
	},

	password:{
	type:String,
	required:true
	},

	phone:{
	type:Number,
	required:true
	},
	isVerified:{
		type:Boolean,
		default:false
	}
})

export const User = mongoose.model<Iuser>('User', userSchema);