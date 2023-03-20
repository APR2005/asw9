const express = require("express");
const route = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
// requiring  user controllers

const userController = require("../controller/userController");

const userAuth = require("../middleWares/userAuth");

const config = require("../config/config");

const nocache = require("nocache");

// ! sms

const sms = require("fast2sms");
const otp = Math.floor(1000 + Math.random() * 9000);
// !================================================

route.use(nocache());

route.use(cookieParser());

//session
route.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

// get methods

route.get("/", userController.loadHome);

route.get("/product", userController.loadProduct);

route.get("/cart",userAuth.isLogout, userController.loadCart);

route.get("/contact", userController.loadContact);

route.get("/shop", userController.loadShop);

route.get("/login", userAuth.isLogin, userController.loadLogin);

route.get("/logout", userAuth.logout);

route.get("/productDetails", userController.loadProductDetails);

route.get("/checkout", userAuth.isLogout, userController.loadCheckout);

route.get("/orderSuccess", userController.loadOrderSuccess);

route.get('/loadOrderSuccess',userAuth.isLogout,userController.loadOrderSuccess)


route.post('/placeOrder',userController.placeOrder)

route.get("/addToCart", userAuth.isLogout, userController.addToCart);

route.get("/deleteCart", userController.deleteCart);

route.get("/resetPassword", userController.loadForgetPassword);


route.get("/forgetPassword",userAuth.isLogin, userController.loadForgetPassword);

route.get("/orderSummary", userController.loadOrderSummary);

route.get("/editAddress", userController.loadEditAddress);

route.get('/address',userController.loadAddress)

route.get('/editProfile',userAuth.isLogout,userController.loadEditUserProfile)

route.get("/addCartDeleteWishlist", userController.addCartDeleteWishlist);

route.get("/deleteAddress", userController.deleteAddress);

// route.get("/deleteAddress1", userController.deleteAddressPRofile);


route.get("/addToWishlist", userController.addToWishlist);

route.get("/deleteWishlist", userController.deleteWishlist);

route.get("/userProfile", userController.loadUserProfile);

route.get("/wishlist", userController.loadWishlist);

route.get("/userProfile", userController.loadUserProfile);

route.get("/otp", userController.loadOtp);

route.get("/orderDetails",userAuth.isLogout, userController.loadOrderDetails);

route.get("/cancelOrder", userController.cancelOrder);

route.get("/returnOrder", userController.returnOrder);

route.get('/forgetPassword', userController.loadForgetPassword)

route.get('/paymentFailure',userAuth.isLogout,userController.orderFailed)


// post methods

route.post("/register", userController.registerUser, userController.loadOtp);

route.get('/viewOrder',userAuth.isLogout,userController.viewOrders)



route.get("/register", userController.loadRegister);

route.post("/editaddress", userController.editAddress);

route.post("/login", userController.verifyLogin);

route.post("/forgetPassword", userController.forgetPassword);

route.post("/otp", userController.verifyOtp);

route.post("/addAddress", userController.addAddress);

route.post("/verifyForgetOtp",userController.verifyForgetPassword);

 
route.post("/changePassword", userController.changePassword);

route.post('/razorpay', userController.payment,userController.loadOrderSuccess)

route.post('/addCoupen', userController.addCouponValue)

route.post('/editUser',userAuth.isLogout,userController.editUserProfile)

route.post('/editCart',userController.editCart)

route.post('/forgetPassword', userController.forgetPassword)

route.post('/verifyForgetOtp',userController.verifyForgetPassword)





module.exports = route; 
