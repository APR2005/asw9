const mongoose = require("mongoose");
const Product = require("./productModel");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
   dob:{
      type : Date,
      // required :true,
   },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  password2: { 
    type: String,
  },
  isAdmin: {
    type: Number,
    // required: true
  },
  isAvailable: {
    type: Number,
  },
  cart: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
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
  wishlist: {
    item: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "products",
          required: true,
        },
        price: {
          type: Number,
          default :0
        },
        qty:{
          type:Number,
          default:1
        }
        
      },
    ],
  },
});

userSchema.methods.addToCart = function (product,qty) {
  const cart = this.cart
  console.log("cart is="+cart);
  const isExisting = cart.item.findIndex((objInItems) => {
      return (
          new String(objInItems.productId).trim() == new String(product._id).trim()
      )
  })
  console.log("isExisting is="+isExisting); //-1
  if (isExisting >= 0) {
    console.log('qty');
      cart.item[isExisting].qty += qty
      cart.totalPrice += product.price*cart.item[isExisting].qty
  } else {
    if(!qty)
    {

      cart.item.push({ productId: product._id,qty:1, price: product.price })
      cart.totalPrice += product.price * 1
      console.log(product.price);
      
    }else{
      cart.item.push({ productId: product._id, qty:qty, price: product.price })
      cart.totalPrice += product.price * qty
      console.log(product.price);
      console.log(qty);
    }
      
  }console.log('sshgd ja');
  
  console.log('User in schema:', this)
  return this.save()
}

userSchema.methods.removefromCart = async function (productId) {
  
  const cart = this.cart
  const isExisting = cart.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  )
  if (isExisting >= 0) {
    const prod = await Product.findById(productId)
    cart.totalPrice -= prod.price * cart.item[isExisting].qty
    cart.totalPrice = cart.totalPrice;
    cart.item.splice(isExisting, 1)
    console.log('User in schema:', this)
    return this.save()
  }
}

userSchema.methods.addToWishlist = function (product) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex((item) => {
    console.log(item.productId, "==", product._id);

    return new String(item.productId).trim() == new String(product._id).trim();
  });
  console.log(isExisting);
  if (isExisting >= 0) {
  } else {
    wishlist.item.push({
      productId: product._id,
       price: product.price,
       qty:1
    });
  }
  return this.save();
};

userSchema.methods.removefromWishlist = async function (productId) {
  const wishlist = this.wishlist;
  const isExisting = wishlist.item.findIndex(
    (objInItems) =>
      new String(objInItems.productId).trim() === new String(productId).trim()
  );
  if (isExisting >= 0) {
    wishlist.item.splice(isExisting, 1);
    return this.save();
  }
};

userSchema.methods.placeOrder = function () {
  let cart = this.cart;
  // const isExisting = cart.item.findIndex((item) => {
  //   return new String(item.productId).trim() == new String(product).trim();
  // });

  // if (isExisting >= 0) {
  //   cart.item.splice(isExisting, 1);

  //   return this.save();
  // }

  cart.item.splice()
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
