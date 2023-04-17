export const isValidSymbol = (stockSymbol:string):Boolean =>{
    const pattern = /^[A-Z0-9.]{1,10}$/;
    return pattern.test(stockSymbol)
}
