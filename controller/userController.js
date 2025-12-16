import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";        
dotenv.config();

export function createUser(req,res){
    if(req.body.role == "admin"){
        if(req.user != null){
            if(req.user.role != "admin"){
                res.status(403).json({
                    message : "You are not authorized to create an admin, Please login first."
                })
                return
            }
        }else{
            res.status(403).json({
                message : "You are not authorized to create an admin, Please loging first."
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password,10)

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hashedPassword,
        role : req.body.role,
    })

    user.save()
    .then(() => {res.json({
        message: "User created successfully" })})
    .catch((error) => {res.json({
        error: error.message })});
}

export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.findOne({email : email}).then(
        (user) => {
            if(user==null){
                res.status(404).json({
                    message : "User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password , user.password)
                if(isPasswordCorrect){
                    const token = jwt.sign(
                        {
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            img : user.img
                        },
                        process.env.JWT_KEY
                    )

                    res.json({
                        message : "Loging Successful",
                        token : token,
                        role : user.role
                    })
                }else{
                    res.status(401).json({
                        message : "Invalid Password"
                    })
                }
            }
        }
    )
}

export async function loginWithGoogle(req,res){
    const token = req.body.accessToken;
    if(token == null){
        res.status(400).json({
            message : "Access token is null"
        });
        return
    }

    const response = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    console.log(response.data);

    // Fallback names in case given_name / family_name missing
    const email = response.data.email;
    const emailName = email.split("@")[0];
    const firstName = response.data.given_name || emailName;
    const lastName  = response.data.family_name || "User";
    const picture   = response.data.picture;

    // check user is already in database
    const user = await User.findOne({
        email : email
    })

    if(user == null){
        const newUser = new User({
            email : email,
            firstName : firstName,
            lastName : lastName,
            password : "googleUser",
            img : picture
        })
        await newUser.save();
        const token = jwt.sign(
            {
                email : newUser.email,
                firstName : newUser.firstName,
                lastName : newUser.lastName,
                role : newUser.role,
                img : newUser.img
            },
            process.env.JWT_KEY
        )
        res.json({
            message : "Loging Successful",
            token : token,
            role : newUser.role
        })
    }else{
        const token = jwt.sign(
            {
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                img : user.img
            },
            process.env.JWT_KEY
        )
        res.json({
            message : "Loging Successful",
            token : token,
            role : user.role
        })
    }
}

const transport = nodemailer.createTransport({
    service : "Gmail",
    host : "smtp.gmail.com",
    port : 587,
    secure : false,
    auth : {
        user : "dulariwathsala824@gmail.com",
        pass : "kzqautidxdnlyvxc"
    }
})

export async function sendOTP(req,res){
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;
    if(email == null){
        res.status(400).json({
            message : "Email is required"
        });
        return;
    }

    const user = await User.findOne({
        email : email
    })
    if(user == null){
        res.status(404).json({
            message : "User not found"
        });
        return;
    }

    // delete all previous OTPs
    await OTP.deleteMany({
        email : email
    })

    const message = {
        from : "dulariwathsala824@gmail.com",
        to : email,
        subject : "OTP for password reset",
        text : "This is your OTP for password reset: " + randomOTP
    }

    const otpDoc = new OTP({
        email : email,
        otp : randomOTP
    })

    await otpDoc.save();

    transport.sendMail(message, (error, info) => {
        if(error){
            res.status(500).json({
                message : "Fail to send OTP",
                error : error
            });
        }else{
            res.json({
                message : "OTP sent successfully",
                otp : randomOTP
            });
        }
    })
}

export async function resetPassword(req,res){
    const otp = req.body.otp;        // read "otp" from body
    const email = req.body.email;
    const newPassword = req.body.newPassword;

    
    const response = await OTP.findOne({
        email : email,
    })

    if(response == null){
        return res.status(500).json({
            message : "OTP not found, please request a new one"
        });
    }

    // compare user otp with stored otp
    if(otp != response.otp){
        return res.status(403).json({
            message : "Invalid OTP"
        })
    }

    // correct OTP
    await OTP.deleteMany({
        email : email
    })

    const hashedPassword = bcrypt.hashSync(newPassword,10)
    await User.updateOne(
        {email : email},
        {password : hashedPassword}
    )

    return res.json({
        message : "Password reset successful"
    })
}

export function isAdmin(req){
    if(req.user == null){
        return false
    }

    if(req.user.role != "admin"){
        return false
    }

    return true
}
