import {Response } from "express";
import { Request } from "../types";
import { History } from "../database_models/history";

export const historyUser = async(req:Request, res:Response)=>{
    try {

        let page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;

        const skip = (page-1)*limit;

        const _id = req.user._id;

    const findHistory = await History.find({userId:_id}, {userId:0})
                                  .skip(skip)
                                  .limit(limit);
    
    console.log("findHistory", findHistory)
    if(!findHistory.length){
        return res.status(404).json({error: "You have not made any search yet."})
    }
    
    const countUser = await History.find({userId:_id}, {userId:0})

    return res.status(200).json({
        count: `You have made total ${countUser.length} searches`,
        findHistory
    }) ;
    } catch (err:any) {
        return res.status(400).json({error: err.message})
        
    }
}
