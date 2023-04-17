import {Response} from "express";
import {Request} from "../types";
import cron from "node-cron"
import { Stock } from "../database_models/stocks";
import { History } from "../database_models/history";
import { fetchLast7DaysData } from "../modules/fetchLast7DaysData";
import { isValidSymbol } from "../modules/isValidateSymbol";
import { updateStockDailyAt8 } from "../modules/updateDailyStock";

export const getStock = async (req:Request, res:Response)=>{
    try {

        let stockSymbol = req.query.symbol;
        // console.log(stockSymbol)
        // let {symbol:string} = req.query;
        cron.schedule("0 8 * * *", ()=>{
            updateStockDailyAt8();
        })
        
        if(typeof stockSymbol==='string'){

            if(!stockSymbol){
                return res.status(404).json({error: "Which company's stock you are looking for..."})
            }
    
            if(!isValidSymbol(stockSymbol.toUpperCase())){
                return res.status(404).json({error: "stock symbol is invalid"})
            }
    
            let id = req.user._id;
            console.log(id);

            const saveHistory = new History({
                userId:id,
                symbol:stockSymbol.toUpperCase()
            })

            await saveHistory.save();     //history saved
            const isSymbolPresent = await Stock.find({symbol:stockSymbol.toUpperCase()}, {userId:0})
            // console.log("isSymbolPresent", isSymbolPresent)
            if(isSymbolPresent.length){
                return res.status(200).json({stockDetails: isSymbolPresent})
            }
            
            const last7DaysData = await fetchLast7DaysData(stockSymbol);
            if(last7DaysData=='noData'){
                return res.status(404).json({error: `No company has ${stockSymbol} as their stock symbol`})
            }
            
            const stockCreate = new Stock({
                userId:id,
                symbol:stockSymbol.toUpperCase(),
                stockDetails:last7DaysData
            })
            await stockCreate.save();     //stock saved
           
            return res.status(200).json({last7DaysData})
        }else{
            return res.status(404).json({error: "Provide a stock's symbol"})
        }
        
    } catch (err:any) {
        return res.status(404).json({error: err.message})
        // console.log(err)
    }

}
