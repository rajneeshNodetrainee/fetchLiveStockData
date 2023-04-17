import mongoose,{Types} from 'mongoose'

const historySchema = new mongoose.Schema({
    userId:{
        type:Types.ObjectId,
        required:true
    },
    symbol:{
        type:String,
        required:true
    },
    date: {
        type:Date,
        default : new Date()
    }
})


export const History = mongoose.model('History', historySchema);