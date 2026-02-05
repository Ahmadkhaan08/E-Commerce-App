import asyncHandler from "express-async-handler";
import userModel from "../models/userModel.js";

// get User Profiles
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find({}).select("-password");
  res.status(200).json({
    success: true,
    users,
  });
});

// Create User
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, addresses } = req.body;

  const userExists = await userModel.findOne({ email });
  if (userExists) {
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
      avatar: newUser.avatar,
      role: newUser.role,
      addresses: newUser.addresses || [],
    });
  } else {
    res.status(401);
    throw new Error("Invalid user data!");
  }
});

// get User by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id).select("-password");
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

// update User
export const updateUser = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  //   Update Data
  user.name = req.body.name || user.name;
  if (req.body.password) {
    user.password = req.body.password;
  }
  if (req.body.role) {
    user.role = req.body.role;
  }
  user.addresses = req.body.addresses || user.addresses;

  const updatedUser = await user.save();
  if (updatedUser) {
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      password: updatedUser.password,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      addresses: updatedUser.addresses || [],
    });
  }
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  } else {
    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: "User delete successfully!",
    });
  }
});

// Add Address
export const addAddress = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to modify this user's addresses");
  }

  const { street, city, country, postalCode, isDefault } = req.body;
  if (!street || !city || !country || !postalCode) {
    throw new Error("Add all addresses fields!");
  }

  // If this is set as default, make other addresses non-default
  if (isDefault) {
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  // If this is the first address, make it default
  if (user.addresses.length === 0) {
    user.addresses.push({
      street,
      city,
      country,
      postalCode,
      isDefault: true,
    });
  } else {
    user.addresses.push({
      street,
      city,
      country,
      postalCode,
      isDefault: isDefault || false,
    });
  }

  await user.save()
  res.json({
    success:true,
    addresses:user.addresses,
    message:"New Address Added!"
  })
});

// Update address
export const updateAddress=asyncHandler(async(req,res)=>{
    const user = await userModel.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to modify this user's addresses");
  }

  const address=await user.addresses.id(req.params.addressId)

  if(!address){
    res.status(404);
    throw new Error("Address not found");
  }

    const { street, city, country, postalCode, isDefault } = req.body;
    if(street)  address.street=street
    if(city) address.city=city
    if(country) address.country=country
    if(postalCode) address.postalCode=postalCode

     // If this is set as default, make other addresses non-default
    if(isDefault){
        user.addresses.forEach((addr)=>{
            addr.isDefault=false
        })
            isDefault=true
    }

    await user.save()
      res.json({
    success:true,
    addresses:user.addresses,
    message:"Address updated successfully!"
  })

})

// delete address
export const deleteAddress=asyncHandler(async(req,res)=>{
    const user = await userModel.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Only allow user to modify their own addresses or admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to modify this user's addresses");
  }

  const address=await user.addresses.id(req.params.addressId)

  if(!address){
    res.status(404);
    throw new Error("Address not found");
  }
// If deleting default address, make the first remaining address default
  const wasDefault=address.isDefault
  user.addresses.pull(req.params.addressId)

  if(wasDefault && user.addresses.length>0){
    user.addresses[0].isDefault=true
  }
     await user.save()
      res.json({
    success:true,
    addresses:user.addresses,
    message:"Address deleted successfully!"
  })
})