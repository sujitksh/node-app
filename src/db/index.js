import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try {
        const dbConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\n MongoDB connecting !!  DB HOST:${dbConnection.connection.host}`);
        
    } catch (error) {
         console.log("MongoDB not connecting",error);
         process.exit(1);
    }
}
export default connectDB;