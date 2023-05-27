import { Stock } from "../database_models/stocks";
import { fetchLast7DaysData } from "./fetchLast7DaysData";

export const updateStockDailyAt8 = async ()=>{
    const allStocks = await Stock.find();

    for(let i=0;i<allStocks.length; i++){
		// console.log(allStocks[i].symbol)
        let stockSymbol = allStocks[i].symbol;
        const last7Days = await fetchLast7DaysData(stockSymbol);
        const updatedResult = await Stock.findOneAndUpdate({
                                            symbol:stockSymbol}, 
                                            {stockDetails:last7Days}
                                            )
        // console.log(i)
	}
}