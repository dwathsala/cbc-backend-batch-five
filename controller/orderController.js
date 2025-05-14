import Order from "../models/order"

export async function createOrder(req,res) {
      //get user information
      if(req.user == null){
        res.status(403).json({
            message : "Please login and try again"
        })
        return
      }

      const orderInfo = req.body

      //add current users name if not provided
      if(orderInfo.name == null){
        orderInfo.name = req.user.firstName + " " + req.user.lastName
      }

      //orderId generate ------>  CBC00001  , CBC00002
      let orderId = "CBC00001"

      const lastOrder = await Order.find().sort({date : -1}).limit(1) // -1 ---> last date come first and previos date come after the first date
      //output will come as an array ---->[]
      if(lastOrder.lenght > 0 ){
        const lastOrderId = lastOrder[0].orderId
        
      }

      //create order objaect
}