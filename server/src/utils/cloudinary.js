import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const uploadOncloudinary = async(localFilePath)=>{
    try{
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto",
        })

        console.log ("CLOUDINARY RESPONSE :", response);

        // remove file from server
        fs.unlinkSync(localFilePath);

        return response;
    }catch(err){
        console.error("CLOUDINARY UPLOAD ERROR :", err);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOncloudinary}