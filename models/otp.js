import mongoose from "mongoose";

const otpSchema = mongoose.Schema({
    email : {
        required: true,
        type: String,
    },
    otp : {
        required: true,
        type: Number,
    },
})

const product = mongoose.model("otp", otpSchema);
export default product;
