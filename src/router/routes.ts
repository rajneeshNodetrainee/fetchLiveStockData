import express from "express"
import {get} from "../controller/get"
import {registerUser} from "../controller/registerUser"
import {loginUser} from "../controller/loginUser"
import { verifyOtp } from "../controller/verifyOtp"
import { getUser } from "../controller/getUser"
import {getStock} from "../controller/getStock"
import {auth} from "../middlewares/auth"
import { historyUser } from "../controller/historyUser"
import { updateStock } from "../controller/updateStock"
import { sendMail } from "../controller/sendMail"
import { getSymbol } from "../controller/getSymbol"

export const router = express.Router();

router.get("/", get)

router.post("/api/v1/user/register", registerUser)

router.post("/api/v1/user/login",loginUser)

router.get("/api/v1/user/get",auth, getUser)

router.post("/api/v1/verifyOtp", verifyOtp)

router.get("/api/v1/user/history",auth, historyUser)

router.get("/api/v1/stock/get",auth, getStock)

router.patch("/api/v1/stock/update",auth, updateStock)

router.post("/api/v1/sendmail", sendMail)

router.get("/api/v1/getsymbol",auth, getSymbol)