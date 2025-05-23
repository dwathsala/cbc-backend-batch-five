import express from "express";
import { createReview, getProductReviews } from "../controller/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", createReview);
reviewRouter.get("/:productId", getProductReviews);

export default reviewRouter;
