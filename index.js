import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
import { decode } from "jsonwebtoken";
import jwd from "jsonwebtoken"
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

const app = express();

app.use(bodyParser.json());

app.use(
    (req,res,next)=>{
        const tokenString = req.header("Authorization")
        if(tokenString != null){
            const token = tokenString.replace("Bearer ","")
            console.log(token)

            jwd.verify(token, "cbc-batch5-2025", 
                (err,decoded)=>{
                    if(decoded != null){
                        console.log(decoded)
                        req.user = decoded
                        next()
                    }
                    else{
                        console.log("Invalid Token")
                        res.status(403).json({
                            message : "Invalid token"
                        })
                    }
                }
            )
        }
        else{
            next()
        }
        //next()
    })

mongoose.connect("mongodb+srv://admin:123@cluster0.spz2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Connected to the database");
    })
    .catch(() => {
        console.log("Database connection failed");
    });


app.use("/products",productRouter);
app.use("/users",userRouter);
app.use("/orders",orderRouter);
app.use("/reviews", reviewRouter);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
