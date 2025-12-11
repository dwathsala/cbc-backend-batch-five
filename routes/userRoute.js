import express from "express"
import { createUser, loginUser, loginWithGoogle } from "../controller/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser)

userRouter.post("/login",loginUser)

userRouter.post("/login/google", loginWithGoogle)

export default userRouter;