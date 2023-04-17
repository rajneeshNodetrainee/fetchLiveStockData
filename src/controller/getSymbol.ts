import { Request ,Response} from "express";

export const getSymbol = async (req:Request, res:Response)=>{
const api = process.env.ALPHA_API_KEY
let {symbol} = req.query;
let page = parseInt(req.query.page as string) || 1;
let limit = parseInt(req.query.limit as string) || 10; 

console.log(typeof symbol)
const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${api}`;

const result = await fetch(url);
const response = await result.json();
return res.status(200).json({response})

}
