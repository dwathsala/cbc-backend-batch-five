import Review from "../models/review.js";

export async function createReview(req, res) {
    if (!req.user) {
        return res.status(403).json({ message: "Please login to add a review" });
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const review = new Review({
            productId,
            userId: req.user.id,
            userName: req.user.firstName + " " + req.user.lastName,
            rating,
            comment,
        });

        const savedReview = await review.save();
        res.status(201).json({ message: "Review submitted", review: savedReview });
    } catch (err) {
        res.status(500).json({ message: "Failed to create review", error: err });
    }
}

export async function getProductReviews(req, res) {
    const productId = req.params.productId;

    try {
        const reviews = await Review.find({ productId }).sort({ date: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reviews", error: err });
    }
}
