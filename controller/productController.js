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
