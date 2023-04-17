import { Response } from "express";
import { Request } from "../types";
import { User } from "../database_models/user";
import { Stock } from "../database_models/stocks";
import { myDocument } from "../types";
import { emptyRequestBody } from "../modules/emptyRequestBody";
import { isValidSymbol } from "../modules/isValidateSymbol";
import { fetchLast7DaysData } from "../modules/fetchLast7DaysData";

export const updateStock = async(req:Request, res:Response)=>{
    try {

        if(emptyRequestBody(req)){
            return res.status(404).json({error: "Nothing to update"})
        }

        const symbol = req.body.symbol;
        console.log("stockSymbol", symbol.toUpperCase())

        if(!isValidSymbol(symbol.toUpperCase())){
            return res.status(401).json({error: "stock symbol is invalid"})
        }

        const findSymbol = await Stock.findOne({symbol:symbol.toUpperCase()}) as myDocument

        if(!findSymbol){
            return res.status(404).json({error: `${symbol} is not availble for updation`})
        }

        //check if user is valid
        // const _id = req.user._id;
        
        // const findUser = await User.findOne({_id:_id})
        // if(!findUser){
        //     return res.status(401).json({error: "First register yourself in the application"})
        // }

        const stockSymbol = findSymbol.symbol;
        // console.log(typeof stockSymbol)
        // console.log(typeof findSymbol.symbol)
        // console.log(stockSymbol)
        //check if stock is up-to-date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-2)

        const findStockLatestDate = findSymbol.stockDetails[0].date

        const givenDate = new Date(findStockLatestDate)

        if(yesterday<givenDate){
            return res.status(400).json({error: `${symbol} is up to date`})
        }
        
            const last7DaysData = await fetchLast7DaysData(stockSymbol)
            // console.log("last7DaysData", last7DaysData)
            const updatedResult = await Stock.findOneAndUpdate({
                                                    symbol:symbol.toUpperCase()}, 
                                                    {stockDetails:last7DaysData}
                                                    )

            // console.log("updatedResult",     updatedResult)

            return res.status(200).json({
                message: "Stock updated successfully..."
            })

    } catch (err:any) {
        return res.status(400).json({error: err})
    }
}
