import dotenv from 'dotenv'
import express,{Application} from "express"
import {router} from "./router/routes.ts"
import cors from 'cors';
import {dbConnect} from "./database_connection/mongodb.ts"
import path from 'path'
const dotenvPath = path.join(__dirname, '..', 'src', '.env')

// console.log(dotenvPath)
dotenv.config({path: dotenvPath})

const app:Application = express()
app.use(cors({
	origin: '*'
	}));

app.use(express.json())
app.use(router)

dbConnect();

app.listen(3000, ()=>{
	console.log("Started listening at port 3000")
})
