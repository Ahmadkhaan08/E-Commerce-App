import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const isExists = await userModel.findOne({ email });
  if (isExists) {
    res.status(400);
    throw new Error("User already exists!");
  }

  const newUser = await userModel.create({
    name,
    email,
    password,
    role,
    addresses: [],
  });
  if (newUser) {
    res.status(200).json({
      _id: newUser._id,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      addresses: newUser.addresses,
    });
  } else {
    res.status(401);
    throw new Error("Invalid user data!");
  }
  // console.log("req : ",req.body)
  // res.send(200)
});

//Login User
export const loginUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    const user=await userModel.findOne({email})

    if(user && (await user.matchPassword(password))){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            password: user.password,
            role: user.role,
            addresses: user.addresses,
            token:generateToken(user._id)
        })
    }else{
        res.status(401);
        throw new Error("Invalid Credentials!");
    }
})

// Get User Profile Data
export const userProfile=asyncHandler(async(req,res)=>{
    const user=await userModel.findById(req.user._id)

    if(user){
        res.status(200).json({
            _id: user._id,
            name: user.name,
            password: user.password,
            role: user.role,
            addresses: user.addresses,
            token:generateToken(user._id)
        })
    }else{
        res.status(404);
        throw new Error("User not found!");
    }
})

// User Logout
export const userLogout=asyncHandler(async(req,res)=>{
    res.status(200).json({
        success:true,
        message:"User logout Successfully!"
    })
})