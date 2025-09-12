import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRoute.js";
import userRouter from "./routes/userRoute.js";
//import { decode } from "jsonwebtoken";
import jwd from "jsonwebtoken"
import cors from "cors";

const app = express();
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";


app.use(cors()); //inside the cors we can write who can access the api --> example: localhost:5173
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


app.use("/api/products",productRouter);
app.use("/api/users",userRouter);
app.use("/api/orders",orderRouter);
app.use("/api/reviews", reviewRouter);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
