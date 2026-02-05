import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["user","admin","deliveryman"],
        default:"user"
    },
    avatar:{
        type:String,
        default:"https://img.freepik.com/premium-vector/man-professional-business-casual-young-avatar-icon-illustration_1277826-627.jpg?w=360"
    },
    addresses:[
        {
            street:{
            type:String,
            required:true
            },
            city:{
            type:String,
            required:true
            },
            country:{
            type:String,
            required:true
            },
            postalCode:{
            type:String,
            required:true
            },
            isDefault:{
                type:Boolean,
                default:false
            }
        }
    ],
    wishlist:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    cart:[
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required:true
            },
            quantity:{
                type:Number,
                required:true,
                min:1
            }
        }
    ]
},{timestamps:true})



// Encrypt password using bcrypt
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
   const salt = await bcrypt.genSalt(10)
   this.password=await bcrypt.hash(this.password,salt)
})

// Match user entered password to hashed password in database
userSchema.methods.matchPassword=async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

// Ensure only one address is default
userSchema.pre("save",async function(next){
    if(this.isModified("addresses")){
        const defaultAddress=this.addresses.find((addr)=>addr.isDefault)
        if(defaultAddress){
            this.addresses.forEach((addr) => {
                if(addr!==defaultAddress) addr.isDefault=false
            });
        }
    }
    next()
})


const userModel=mongoose.model("User",userSchema)
export default userModel