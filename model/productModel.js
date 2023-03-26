const mongoose = require("mongoose");
const category = require('./categoryModel')

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref:'Category'
  },
  price: {
    type: Number, 
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: Array,
  },
  quantity: {
    type: Number,
    default:1
    // required: true
  },
  isAvailable: {
    type: Boolean,
    required: true,
  },
  sales:{
    type:Number,
    default:0,
}
});

module.exports = mongoose.model("products", ProductSchema);
