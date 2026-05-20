import express from "express"

import isAuth from "../middlewares/isAuth.js"
import isRole from "../middlewares/isRole.js"
import { addItem, deleteItem, editItem, getItemByCity, getItemById, getItemsByShop, rating, searchItems } from "../controllers/item.controllers.js"
import { upload } from "../middlewares/multer.js"

const itemRouter=express.Router()

// Owner only
itemRouter.post("/add-item",isAuth,isRole("owner"),upload.single("image"),addItem)
itemRouter.post("/edit-item/:itemId",isAuth,isRole("owner"),upload.single("image"),editItem)
itemRouter.get("/delete/:itemId",isAuth,isRole("owner"),deleteItem)

// Any authenticated user
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById)
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity)
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemsByShop)
itemRouter.get("/search-items",isAuth,searchItems)
itemRouter.post("/rating",isAuth,isRole("user"),rating)

export default itemRouter