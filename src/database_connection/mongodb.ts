import mongoose from "mongoose"

export const dbConnect = ():void =>{
	mongoose.connect("mongodb://0.0.0.0:27017/stocks")
	.then(()=>console.log("connected to database"))
	.catch((e:any)=>console.log(e))

}
