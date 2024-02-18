import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/FileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateUserAccessAndRefreshToken = async(userId)=>{
    try {
         const user = await User.findById(userId);
         const accessToken = await user.generateAccessToken();
         const refreshToken = await user.generateRefreshToken();
         user.refreshToken = refreshToken;
         user.save({validateBeforeSave:false});

         return {refreshToken,accessToken}
    } catch (error) {
       throw new ApiError(500,"Something went wrong while generate token")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    const {username, fullname,email,password} = req.body;
   if([username,fullname,email,password].some((field)=>{
      field?.trim() === ""
   })){
      throw new ApiError(400,"All fields are required")
   }

   const user = await User.findOne({
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

   const userResponse = await User.findById(createUser._id).select("-password -refreshToken");
   if(!userResponse){
      throw new ApiError(500,"something went wrong while registering user")
   }

   return res.status(201).json(
    new ApiResponse(200,userResponse,"User Register Successfully!!")
   )
})

const loginUser = asyncHandler(async(req,res)=>{
    const {username, email, password} = req.body;
    
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
    const user = await User.findOne({
      $or:[{username},{email}]
    });
    if(!user){
      throw new ApiError(404,"user is not exit");
    }

    const userPass = await user.isPasswordCorrect(password);
    
    if(!userPass){
      throw new ApiError(401,"Wrong user credential")
    }

    const {accessToken,refreshToken} = await generateUserAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
         httpOnly:true,
         secure:true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
          user:loggedInUser,accessToken,refreshToken
        },"User LoggedIn succesfully!!")
    );
})

const logoutUser = asyncHandler(async(req,res)=>{
   User.findByIdAndUpdate(
    req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
   )

   const options = {
    httpOnly:true,
    secure:true
}
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(200,{},"User LoggedOut")
})
export {registerUser,loginUser,logoutUser}