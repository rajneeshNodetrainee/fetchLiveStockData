"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_dotenv = __toESM(require("dotenv"));
var import_express2 = __toESM(require("express"));

// src/router/routes.ts
var import_express = __toESM(require("express"));

// src/database_models/stocks.ts
var import_mongoose = __toESM(require("mongoose"));
var stockSchema = new import_mongoose.default.Schema({
  userId: {
    type: import_mongoose.Types.ObjectId,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    unique: true
  },
  stockDetails: {
    type: Object,
    required: true
  }
});
var Stock = import_mongoose.default.model("Stock", stockSchema);

// src/controller/get.ts
var get = async (req, res) => {
  const allStock = await Stock.find();
  for (let i = 0; i < allStock.length; i++) {
    console.log(allStock[i].symbol);
  }
  res.send(allStock);
};

// src/controller/registerUser.ts
var import_validator = __toESM(require("validator"));

// src/database_models/user.ts
var import_mongoose2 = __toESM(require("mongoose"));
var userSchema = new import_mongoose2.default.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
});
var User = import_mongoose2.default.model("User", userSchema);

// src/controller/registerUser.ts
var import_bcryptjs = __toESM(require("bcryptjs"));

// src/modules/sendOtp.ts
var import_twilio = __toESM(require("twilio"));
var sgMail = __toESM(require("@sendgrid/mail"));
var otp;
var otpTimestamp;
var sendOtpOnWhatsapp = async () => {
  const client = (0, import_twilio.default)(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
  otp = Math.floor(Math.random() * 9e4) + 1e4;
  client.messages.create({
    body: `Your otp is ${otp}`,
    from: "whatsapp:+14155238886",
    to: "whatsapp:+917030138451"
  }).then((message) => {
    console.log(message.sid);
    console.log("otpTimestamp", otpTimestamp);
  }).catch((e) => console.log(e));
  console.log("otp", otp);
  otpTimestamp = Date.now();
  return { otp, otpTimestamp };
};
var sendOtpOnMail = async (msg) => {
  console.log("api key", process.env.SENDGRID_API_KEY);
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const sentMsg = await sgMail.send(msg);
  console.log("sentMsg", sentMsg);
  console.log("mail sent");
};

// src/database_models/otp.ts
var import_mongoose3 = __toESM(require("mongoose"));
var otpSchema = new import_mongoose3.default.Schema({
  userId: {
    type: import_mongoose3.Types.ObjectId,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  generatedAt: {
    type: Number,
    required: true
  }
});
var Otp = import_mongoose3.default.model("Otp", otpSchema);

// src/modules/emptyRequestBody.ts
var emptyRequestBody = (req) => {
  if (Object.keys(req.body).length) {
    return false;
  }
  return true;
};

// src/controller/registerUser.ts
var registerUser = async (req, res) => {
  try {
    if (emptyRequestBody(req)) {
      return res.status(400).json({ error: "Nothing found" });
    }
    const { name, phone, email, password } = req.body;
    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }
    if (!import_validator.default.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(409).json({ error: "Someone is using this email id" });
    }
    if (!password) {
      return res.status(400).json({ error: "password is required" });
    }
    if (password.length < 8) {
      return res.status(401).json({ error: "Password must be of atleat 8 characters" });
    }
    if (!phone) {
      return res.status(400).json({ error: "phone is required" });
    }
    if (phone.toString().length != 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    const hashedPassword = await import_bcryptjs.default.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone
    });
    await user.save();
    const foundUser = await User.findOne({ email });
    const otp2 = await sendOtpOnWhatsapp();
    const receivedOtp = otp2.otp.toString();
    console.log("otp", otp2);
    const hashedOtp = await import_bcryptjs.default.hash(receivedOtp, 10);
    console.log("hashedOtp", hashedOtp);
    const saveotp = new Otp({
      userId: foundUser?._id,
      otp: hashedOtp,
      generatedAt: otp2.otpTimestamp
    });
    await saveotp.save();
    return res.status(202).json({ message: "Please verify your otp" });
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
};

// src/controller/loginUser.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"));
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var loginUser = async (req, res) => {
  try {
    if (emptyRequestBody(req)) {
      return res.status(404).json({ error: "Nothing found" });
    }
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({ error: "There is no user with this credentials" });
    }
    const isMatch = await import_bcryptjs2.default.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const otp2 = await sendOtpOnWhatsapp();
    const receivedOtp = otp2.otp.toString();
    console.log("otp", otp2);
    const hashedOtp = await import_bcryptjs2.default.hash(receivedOtp, 10);
    console.log("hashedotp", hashedOtp);
    const saveotp = new Otp({
      userId: null,
      otp: hashedOtp,
      generatedAt: otp2.otpTimestamp
    });
    await saveotp.save();
    const loginToken = import_jsonwebtoken.default.sign(
      {
        email,
        id: foundUser._id,
        path: "login"
      },
      process.env.SECRET_KEY,
      { expiresIn: "6h" }
    );
    console.log("login Token", loginToken);
    res.cookie("loginToken", loginToken);
    return res.status(202).json({ message: "OTP has been send to your number" });
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

// src/controller/verifyOtp.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"));
var import_bcryptjs3 = __toESM(require("bcryptjs"));
var verifyOtp = async (req, res) => {
  if (emptyRequestBody(req)) {
    return res.status(400).json({ error: "Nothing in the body" });
  }
  const { otp: otp2, email } = req.body;
  if (!otp2 || !email) {
    return res.status(404).json({ error: "Provide otp and email" });
  }
  const findUser = await User.findOne({ email });
  if (!findUser) {
    return res.status(404).json({ error: "User has not been registered" });
  }
  const otpDetail = await Otp.findOne({ userId: findUser._id });
  if (!otpDetail) {
    return res.status(401).json({ error: "Request an otp first " });
  }
  const otpTimestamp2 = otpDetail.generatedAt;
  console.log(otpTimestamp2);
  if (otp2.toString().length !== 5) {
    return res.status(401).json({ error: "Enter an otp of length 5" });
  }
  if (Date.now() - otpTimestamp2 > 300 * 1e3) {
    return res.status(401).json({ error: "OTP has expired." });
  }
  if (otpDetail.isVerified) {
    return res.status(226).json({ error: "OTP has expired" });
  }
  const isMatch = await import_bcryptjs3.default.compare(otp2.toString(), otpDetail.otp);
  if (isMatch) {
    const newToken = import_jsonwebtoken2.default.sign(
      { id: findUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "48h" }
    );
    res.cookie("jwt", newToken);
    console.log("verified token", newToken);
    const _id = findUser._id;
    await User.findOneAndUpdate({ _id }, { isVerified: true });
    await Otp.findOneAndUpdate({ userId: _id }, { isVerified: true });
    return res.status(201).json({ message: "User Authenticated..." });
  } else {
    return res.status(401).json({ error: "Invalid otp" });
  }
};

// src/controller/getUser.ts
var getUser = async (req, res) => {
  try {
    const _id = req.user._id;
    if (!_id) {
      return res.status(404).json({ error: "User does not exist" });
    }
    const response = await User.findOne({ _id });
    if (!response) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(response);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// src/database_models/history.ts
var import_mongoose4 = __toESM(require("mongoose"));
var historySchema = new import_mongoose4.default.Schema({
  userId: {
    type: import_mongoose4.Types.ObjectId,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: /* @__PURE__ */ new Date()
  }
});
var History = import_mongoose4.default.model("History", historySchema);

// src/modules/fetchLast7DaysData.ts
var import_lodash = __toESM(require("lodash"));
var fetchLast7DaysData = async (stockSymbol) => {
  const api = process.env.ALPHA_API_KEY;
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stockSymbol}&apikey=${api}`;
  const result = await fetch(url);
  const response = await result.json();
  const dailyData = response["Time Series (Daily)"];
  if (import_lodash.default.isNull(dailyData) || import_lodash.default.isUndefined(dailyData) || import_lodash.default.isEmpty(dailyData)) {
    return "noData";
  }
  const filteredData = Object.keys(dailyData).slice(0, 7);
  const last7DaysData = filteredData.map((date) => ({ date, ...dailyData[date] }));
  return last7DaysData;
};

// src/modules/isValidateSymbol.ts
var isValidSymbol = (stockSymbol) => {
  const pattern = /^[A-Z0-9.]{1,10}$/;
  return pattern.test(stockSymbol);
};

// src/controller/getStock.ts
var getStock = async (req, res) => {
  try {
    let stockSymbol = req.query.symbol;
    if (typeof stockSymbol === "string") {
      if (!stockSymbol) {
        return res.status(404).json({ error: "Which company's stock you are looking for..." });
      }
      if (!isValidSymbol(stockSymbol.toUpperCase())) {
        return res.status(404).json({ error: "stock symbol is invalid" });
      }
      let id = req.user._id;
      console.log(id);
      const saveHistory = new History({
        userId: id,
        symbol: stockSymbol.toUpperCase()
      });
      await saveHistory.save();
      const isSymbolPresent = await Stock.find({ symbol: stockSymbol.toUpperCase() }, { userId: 0 });
      if (isSymbolPresent.length) {
        return res.status(200).json({ stockDetails: isSymbolPresent });
      }
      const last7DaysData = await fetchLast7DaysData(stockSymbol);
      if (last7DaysData == "noData") {
        return res.status(404).json({ error: `No company has ${stockSymbol} as their stock symbol` });
      }
      const stockCreate = new Stock({
        userId: id,
        symbol: stockSymbol.toUpperCase(),
        stockDetails: last7DaysData
      });
      await stockCreate.save();
      return res.status(200).json({ last7DaysData });
    } else {
      return res.status(404).json({ error: "Provide a stock's symbol" });
    }
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }
};

// src/middlewares/auth.ts
var import_jsonwebtoken3 = __toESM(require("jsonwebtoken"));
var auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string") {
      const token = authHeader.split(" ")[1];
      const verifyUser = import_jsonwebtoken3.default.verify(token, process.env.SECRET_KEY);
      console.log("verifyUser", verifyUser);
      const user = await User.findOne({ _id: verifyUser.id });
      if (!user) {
        return res.status(404).json({ error: "User doesn't exist" });
      }
      if (!user.isVerified) {
        return res.status(401).json({ error: "Please verify your otp" });
      }
      console.log("user", user);
      req.token = token;
      req.user = user;
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
    next();
  } catch (e) {
    return res.status(404).json({ error: "Please log in to be authorised " });
  }
};

// src/controller/historyUser.ts
var historyUser = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const _id = req.user._id;
    const findHistory = await History.find({ userId: _id }, { userId: 0 }).skip(skip).limit(limit);
    console.log("findHistory", findHistory);
    if (!findHistory.length) {
      return res.status(404).json({ error: "You have not made any search yet." });
    }
    const countUser = await History.find({ userId: _id }, { userId: 0 });
    return res.status(200).json({
      count: `You have made total ${countUser.length} searches`,
      findHistory
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// src/controller/updateStock.ts
var updateStock = async (req, res) => {
  try {
    if (emptyRequestBody(req)) {
      return res.status(404).json({ error: "Nothing to update" });
    }
    const symbol = req.body.symbol;
    console.log("stockSymbol", symbol.toUpperCase());
    if (!isValidSymbol(symbol.toUpperCase())) {
      return res.status(401).json({ error: "stock symbol is invalid" });
    }
    const findSymbol = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!findSymbol) {
      return res.status(404).json({ error: `${symbol} is not availble for updation` });
    }
    const stockSymbol = findSymbol.symbol;
    const yesterday = /* @__PURE__ */ new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const findStockLatestDate = findSymbol.stockDetails[0].date;
    const givenDate = new Date(findStockLatestDate);
    if (yesterday < givenDate) {
      return res.status(400).json({ error: `${symbol} is up to date` });
    }
    const last7DaysData = await fetchLast7DaysData(stockSymbol);
    const updatedResult = await Stock.findOneAndUpdate(
      {
        symbol: symbol.toUpperCase()
      },
      { stockDetails: last7DaysData }
    );
    return res.status(200).json({
      message: "Stock updated successfully..."
    });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

// src/controller/sendMail.ts
var sendMail = async (req, res) => {
  const { email } = req.body;
  console.log("email", email);
  const msg = {
    to: email,
    from: "rajneesh@solulab.com",
    // Use the email address or domain you verified above
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js"
  };
  await sendOtpOnMail(msg);
  console.log("i am here dude...");
};

// src/controller/getSymbol.ts
var getSymbol = async (req, res) => {
  const api = process.env.ALPHA_API_KEY;
  let { symbol } = req.query;
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  console.log(typeof symbol);
  const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${api}`;
  const result = await fetch(url);
  const response = await result.json();
  return res.status(200).json({ response });
};

// src/router/routes.ts
var router = import_express.default.Router();
router.get("/", get);
router.post("/api/v1/user/register", registerUser);
router.post("/api/v1/user/login", loginUser);
router.get("/api/v1/user/get", auth, getUser);
router.post("/api/v1/verifyOtp", verifyOtp);
router.get("/api/v1/user/history", auth, historyUser);
router.get("/api/v1/stock/get", auth, getStock);
router.patch("/api/v1/stock/update", auth, updateStock);
router.post("/api/v1/sendmail", sendMail);
router.get("/api/v1/getsymbol", auth, getSymbol);

// src/app.ts
var import_cors = __toESM(require("cors"));

// src/database_connection/mongodb.ts
var import_mongoose5 = __toESM(require("mongoose"));
var dbConnect = () => {
  import_mongoose5.default.connect("mongodb://0.0.0.0:27017/stocks").then(() => console.log("connected to database")).catch((e) => console.log(e));
};

// src/app.ts
var import_path = __toESM(require("path"));
var dotenvPath = import_path.default.join(__dirname, "..", "src", ".env");
import_dotenv.default.config({ path: dotenvPath });
var app = (0, import_express2.default)();
app.use((0, import_cors.default)({
  origin: "*"
}));
app.use(import_express2.default.json());
app.use(router);
dbConnect();
app.listen(3e3, () => {
  console.log("Started listening at port 3000");
});
