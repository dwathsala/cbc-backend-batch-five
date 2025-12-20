import Product from '../models/product.js';
import { isAdmin } from './userController.js';

export async function getProduct(req, res){
    
    try{
        if(isAdmin(req)){
            const products = await Product.find()
        res.json(products)
        }else{
            const products = await Product.find({isAvailable : true})
            res.json(products)
        }
        
    }catch(err){
        res.json({
            message: "Failed to get product",
            error: err
        })
    }
}


export function saveProduct(req, res) {

    //to check the user is admin or not...
    if(!isAdmin(req)){
        res.status(403).json({
            message: "You are not authorized to add a product"
        })
        return
    }

    const product = new Product(
        req.body
    );

    product
        .save()
        .then(() => {
            res.json({ message: "Product added successfully" });
        })
        .catch((err) => {
            console.error("Error saving product:", err);
            res.status(500).json({ message: "Failed to add product", error: err });
        });
}

export async function deleteProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            massage: "You are not authorized to delete a product"
        })
        return
    }
    try{
        await Product.deleteOne({productId : req.params.productId})

        res.json({
        massage : "Product deleted Successfully"
    })
    }catch(err){
        res.statu(500).json({
            message : "Failed to delete product",
            error :err
        })
    }
}


export async function updateProduct(req,res){
    if(!isAdmin(req)){
        res.status(403).json({
            message: "You are not authorized to update a product"
        })
        return
    }

    const productId = req.params.productId
    const updatingData = req.body

    try{
        await Product.updateOne(
            {productId : productId},
            updatingData
        )

        res.json(
            {
                message : "product updated successfully"
            }
        )

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export async function getProductById(req,res){
    const productId = req.params.productId

    try{
        const product = await Product.findOne(
            {productId : productId}
        )

        if(product == null){
            res.status(404).json({
                message : "Product not found"
            })
            return
        }

        if(product.isAvailable){
            res.json(product)
        }else{
            if(!isAdmin(req)){
                res.status(404).json({
                    message : "Product not found"
                })
                return 
            }else{
                res.json(product)
            }
        }

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}

export async function searchProducts(req,res){
    const searchQuery = req.params.query
    try{
        //product.find is use to search all products in the database
        const products = await Product.find({
            //if anyone of below is correct, it will return the product
            $or : [
                //regex query is used to compare the two texts
                //$option : 'i' is used to ignore case sensitivity
                {name : {$regex : searchQuery, $options : 'i'}},

                //elementMatch is used to compare the array elements like altNames
                {altNames : {$elemMatch : {$regex : searchQuery, $options : 'i'}}},
            ],
            isAvailable : true //only available products will be searched
        })
        res.json(products) //send products to frontend

    }catch(err){
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
    }
}
