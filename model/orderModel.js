const mongoose = require("mongoose");
const product = require("./userModel");
const user = require("./userModel");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },

   name :{
    type:String,
    required :true
  },
 
  payment: {
    type: String,
    required: true

  },

  address: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zip: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },
  products: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          // required:true
        },
        qty: {
          type: Number,
          // required:true
        },
        price: {
          type: Number,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
    deliveryDate:{
      type:Date,
     
    },
  status: {
    type: String,
    default: "Attempted"
  
  },


  productReturned: [
    {
      type: Number,
    },
  ],
});

module.exports = mongoose.model("orders", orderSchema);
