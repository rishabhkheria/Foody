import express from "express"
import isAuth from "../middlewares/isAuth.js"
import isRole from "../middlewares/isRole.js"
import { acceptOrder, getCurrentOrder, getDeliveryBoyAssignment, getMyOrders, getOrderById, getTodayDeliveries, placeOrder, sendDeliveryOtp, updateOrderStatus, verifyDeliveryOtp, verifyPayment } from "../controllers/order.controllers.js"

const orderRouter=express.Router()

// User only
orderRouter.post("/place-order",isAuth,isRole("user"),placeOrder)
orderRouter.post("/verify-payment",isAuth,isRole("user"),verifyPayment)

// User + Owner both (controller handles role-based filtering internally)
orderRouter.get("/my-orders",isAuth,isRole("user","owner"),getMyOrders)

// Owner only
orderRouter.post("/update-status/:orderId/:shopId",isAuth,isRole("owner"),updateOrderStatus)

// DeliveryBoy only
orderRouter.get("/get-assignments",isAuth,isRole("deliveryBoy"),getDeliveryBoyAssignment)
orderRouter.get("/get-current-order",isAuth,isRole("deliveryBoy"),getCurrentOrder)
orderRouter.post("/send-delivery-otp",isAuth,isRole("deliveryBoy"),sendDeliveryOtp)
orderRouter.post("/verify-delivery-otp",isAuth,isRole("deliveryBoy"),verifyDeliveryOtp)
orderRouter.get('/accept-order/:assignmentId',isAuth,isRole("deliveryBoy"),acceptOrder)
orderRouter.get('/get-today-deliveries',isAuth,isRole("deliveryBoy"),getTodayDeliveries)

// Any authenticated user (used by track page)
orderRouter.get('/get-order-by-id/:orderId',isAuth,getOrderById)

export default orderRouter