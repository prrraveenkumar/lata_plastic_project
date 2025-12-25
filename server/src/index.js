import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/index.js";
import app from "./app.js";

dotenv.config({ 
    path: "./.env" 
}); 

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`SERVER is running on port ${process.env.PORT || 8000}`);       
    });
})
.catch((err)=>{
    console.log("MONGO DB CONNETION FAILED :", err);
});