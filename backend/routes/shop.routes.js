import express from "express"
import { createEditShop, getMyShop, getShopByCity } from "../controllers/shop.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import isRole from "../middlewares/isRole.js"
import { upload } from "../middlewares/multer.js"

const shopRouter=express.Router()

// Owner only
shopRouter.post("/create-edit",isAuth,isRole("owner"),upload.single("image"),createEditShop)
shopRouter.get("/get-my",isAuth,isRole("owner"),getMyShop)

// Any authenticated user
shopRouter.get("/get-by-city/:city",isAuth,getShopByCity)

export default shopRouter