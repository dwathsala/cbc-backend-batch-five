import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

export function createUser(req,res){
    if(req.body.role == "admin"){
        if(req.user != null){
            if(req.user.role != "admin"){
                res.status(403).json({
                    message : "You are not authorized to create an admin, Please login first."
                })
                return  //return eka dammat user kenek awe nathi unm code eka run nowi block wenwa
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
                         //password
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
//google login
export async function loginWithGoogle(req,res){
    const token = req.body.accessToken;
    if(token == null){ 
        res.status(400).json({
            message : "Access token is null"
        });
        return
    }
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/tokeninfo",
        {
            headers : {
                Authorization : `Bearer ${token}`
            }
        }
    )  
    console.log(response.data); 

    //to check user is already in database
    const user = await User.findOne({
        email : response.data.email
    })

    /*
        email : {
        type : String,
        required : true,
        unique : true
    },

    firstName : {
        type : String,
        required : true
    },

    lastName : {
        type : String,
        required : true
    },

    password : {
        type : String,
        required : true
    },

    role : {
        type : String,
        required : true,
        default : "customer"
    },

    isBlocked : {
        type : Boolean,
        required : true,
        default : false
    },

    img : {
        type : String,
        required : false,
        default : "https://avatar.iran.liara.run/public/boy?username=Ash" 
    } */
    
    if(user == null){
        const newUser = new User({
            email : response.data.email,
            firstName : response.data.given_name,
            lastName : response.data.family_name,
            password : "googleUser",
            img : response.data.picture
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

    }else{

    }

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