import dotenv from "dotenv";
dotenv.config({path:'./env'});
import express from "express";
import connectDB from "./db/index.js";

 const app = express();
 
 const port = process.env.PORT;
 connectDB();
app.get("/",(req,res)=>{
  res.send("hello bhai");
})
 app.listen(port,()=>{
   console.log(`Running port ${port}`)
 })
