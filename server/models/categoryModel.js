import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    image:{
        type: String,
        required: false,
    },
    categoryType:{
        type:String,
        required:true,
        enum:["Featured","Hot Categories","Top Categories"]
    }
},{timestamps:true})

const categoryModel=mongoose.model("Category",categorySchema)
export default categoryModel