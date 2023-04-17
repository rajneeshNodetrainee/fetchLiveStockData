import mongoose,{Types} from 'mongoose'
import { StockInterface } from '../types'

const stockSchema = new mongoose.Schema({
    userId:{
        type:Types.ObjectId,
        required:true
    },
    symbol:{
        type:String,
        required:true,
        unique:true
    },
    stockDetails:{
        type :Object,
        required:true
    }

})

export const Stock = mongoose.model<StockInterface>('Stock', stockSchema)
