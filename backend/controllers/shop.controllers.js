import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop=async (req,res) => {
    try {
       const {name,city,state,address,latitude,longitude}=req.body
       let image;
       if(req.file){
        console.log(req.file)
        image=await uploadOnCloudinary(req.file.path)
       }

       let location
       if (latitude !== undefined && longitude !== undefined) {
        const latNum = Number(latitude)
        const lonNum = Number(longitude)
        if (!Number.isNaN(latNum) && !Number.isNaN(lonNum)) {
            location = {
                type: 'Point',
                coordinates: [lonNum, latNum]
            }
        }
       }

       let shop=await Shop.findOne({owner:req.userId})
       if(!shop){
        shop=await Shop.create({
        name,city,state,address,image,location,owner:req.userId
       })
       }else{
         const payload = {
            name,city,state,address,owner:req.userId
         }
         if (image) payload.image = image
         if (location) payload.location = location
         shop=await Shop.findByIdAndUpdate(shop._id,{
        ...payload
       },{new:true})
       }
      
       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`create shop error ${error}`})
    }
}

export const getMyShop=async (req,res) => {
    try {
        const shop=await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return null
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`get my shop error ${error}`})
    }
}

export const getShopByCity=async (req,res) => {
    try {
        const {city}=req.params

        const shops=await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")}
        }).populate('items')
        if(!shops){
            return res.status(400).json({message:"shops not found"})
        }
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({message:`get shop by city error ${error}`})
    }
}