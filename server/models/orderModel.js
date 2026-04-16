import mongoose from "mongoose";

const orderItemSchema = mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', 
        required: true
    },
    name : {   
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    discountPercentage:{
        type: Number,
        default: 0
    },
    quantity:{
        type: Number,
        required: true,
        min : 1
    },
    image:{
        type: String,
    },
})

const orderSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true   
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    shippingFee: {
        type: Number,
        default: 0
    },
    total:{
        type: Number,
        default: 0
    },
    status:{
        type: String,
        enum: ['pending', 'processing', 'paid', 'completed', 'cancelled'],
        default: 'pending'
    },
    shippingAddress:{
        street: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    paymentIntentId:{
        type: String,
    },
    stripeSessionId:{
        type: String,
    },
    paidAt:{
        type: Date,
    }
},{timestamps:true});

export default mongoose.model('Order', orderSchema);  