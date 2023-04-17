import { Response } from "express";
import { Request } from "../types";
import { User } from "../database_models/user";


export const getUser = async (req:Request, res:Response):Promise<Response> =>{

    try {
        const _id = req.user._id;
    
    if(!_id){
        return res.status(404).json({error: "User does not exist"})
    }
    
    const response = await User.findOne({_id:_id})
    if(!response){
        return res.status(404).json({error: "User not found"})
    }
    
    return res.status(200).json(response)
    } catch (err:any) {
        return res.status(400).json({error: err.message})
    }
}
