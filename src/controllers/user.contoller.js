import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/FileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req, res)=>{
    const {username, fullname,email,password} = req.body;
   if([username,fullname,email,password].some((field)=>{
      field?.trim() === ""
   })){
      throw new ApiError(400,"All fields are required")
   }

   const user = User.findOn({
     $or:[{email},{username}]
   });

   if(user){
    throw new ApiError(409,"user already exit")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files.coverImage[0]?.path;
   if(!avatarLocalPath){
     throw new ApiError(400, "Avatar image required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
     throw new ApiError(400,"Avatar image required")
   }

   const createUser = await User.create({
     username,
     fullname,
     avatar:avatar.url,
     coverImage:coverImage?.url || "",
     email,
     password
   });

   const userResponse = User.findById(createUser._id).select("-password -refreshToken");
   if(!userResponse){
      throw new ApiError(500,"something went wrong while registering user")
   }

   return res.status(201).json(
    new ApiResponse(200,userResponse,"User Register Successfully!!")
   )
})

export {registerUser}