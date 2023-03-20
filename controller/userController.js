let newOtp;
const userSchema = require("../model/userModel");
const produtModel = require("../model/productModel");
const bcrypt = require("bcrypt");
const Order = require("../model/orderModel");
require("dotenv").config();
const Banner = require("../model/bannerModel");

const message = require("../config/sms");
const { log } = require("handlebars");
const orderModel = require("../model/orderModel");
const addressModel = require("../model/addressModel");
const Offer = require("../model/offermodel");
// const { default: orders } = require("razorpay/dist/types/orders");
const RazorPay = require("razorpay");
const offermodel = require("../model/offermodel");
const moment = require("moment");
const categoryModel = require("../model/categoryModel");
const { trusted } = require("mongoose");
require('dotenv').config()

let newUser;
let findCatagory;

let order;

const login = false;
let offer = {
  name: "None",
  type: "None",
  discount: 0,
  usedBy: false,
};

let coupontotal = 0;
let nocoupon;

const loadHome = async (req, res) => {
  try {
    const session = req.session.user_id;
    const login = false;
    const banner = await Banner.findOne({ is_active: 1 });

    produtModel.find({}).exec((err, product) => {
      if (product) {
        res.render("home", { session, product, login, banners: banner });
      } else {
        res.render("home", { session, login, banners: banner });
      }
    });
  } catch {
    console.log(error);
  }
};

const loadRegister = (req, res) => {
  try {
    res.render("register");
  } catch {
    console.log(error);
  }
};

const loadCart = async (req, res) => {
  try {
    const login = false;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    console.log(userData);
    console.log(userSession.user_id);

    const completeUser = await userData.populate("cart.item.productId");
    console.log(completeUser.cart.totalPrice);

    res.render("cart", {
      user: userData,
      cartProducts: completeUser.cart,
      session: req.session.user_id,
    });
  } catch (error) {
    console.log(error);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await produtModel.findById({ _id: productId });
    console.log(productData);
    userData.addToCart(productData);
    res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const productId = req.query.id;

    userSession = req.session;

    const userData = await userSchema.findById({ _id: userSession.user_id });
    console.log(userData);
    await userData.removefromCart(productId);

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};
const editCart = async (req, res) => {
  try {
    const id = req.query.id;
    // console.log(req.query);
    // console.log(id);
    userSession = req.session;
    const userdata = await userSchema.findById({ _id: userSession.user_id });
    const foundproduct = userdata.cart.item.findIndex(
      (objInItems) => objInItems.productId == id
    );
    const qty = { a: parseInt(req.body.qty) };
    console.log("1");
    console.log(qty);
    userdata.cart.item[foundproduct].qty = qty.a;
    userdata.cart.totalprice = 0;
    const price = userdata.cart.item[foundproduct].price;
    console.log(price);
    const totalprice = userdata.cart.item.reduce((acc, curr) => {
      console.log(curr);
      return acc + curr.price * curr.qty;
    }, 0);
    console.log(userdata.cart.item);

    userdata.cart.totalPrice = totalprice;

    userdata.save();

    console.log(totalprice);
    res.json({ totalprice, price });
  } catch (error) {
    console.log(error.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(productId);
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await produtModel.findById({ _id: productId });

    userData.addToWishlist(productData);
    res.redirect("/shop");
  } catch (error) {
    console.log(error.message);
  }
};

loadWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const completeUser = await userData.populate("wishlist.item.productId");

    res.render("wishlist", {
      id: userSession.user_id,
      products: completeUser.wishlist.item,
      session: req.session.user_id,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const addCartDeleteWishlist = async (req, res) => {
  try {
    userSession = req.session;
    const productId = req.query.id;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    const productData = await produtModel.findById({ _id: productId });
    const add = await userData.addToCart(productData);
    if (add) {
      await userData.removefromWishlist(productId);
    }
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const productId = req.query.id;
    userSession = req.session;
    const userData = await userSchema.findById({ _id: userSession.user_id });
    await userData.removefromWishlist(productId);
    res.redirect("/wishlist");
  } catch (error) {
    console.log(error.message);
  }
};

const loadShop = async (req, res) => {
  try {
    // console.log("hi1");
    const session = req.session.user_id;
    const login = false;
    const categorydata = await categoryModel.find();
    const ID = req.query.id;
    const data = await categoryModel.findOne({ _id: ID });
    const product = await produtModel.find();
    let Catagory = req.query.catagory;
    let catagoryFind = await produtModel.find({ category: Catagory });
    // console.log("catagoryFind:"+catagoryFind);

    if (Catagory == "all") {
      findCatagory = product;
    } else {
      findCatagory = catagoryFind;
    }

    if (!Catagory) {
      res.render("shop", { session, product, login });
    } else {
      // res.json(findCatagory)
      res.render("shop", { session, product: findCatagory, login });
    }
  } catch {
    console.log(error);
  }
};

loadProduct = (req, res) => {
  try {
    const session = req.session.user_id;
    login = false;
    res.render("productDetails", {
      session,
      login,
      userImage: req.session.userImg,
    });
  } catch {
    console.log(error);
  }
};

loadContact = (req, res) => {
  try {
    const session = req.session.user_id;
    const login = false;
    res.render("contact", { session, login });
  } catch {
    console.log(error);
  }
};

loadLogin = (req, res) => {
  try {
    const login = true;
    res.render("login", { login });
  } catch {
    console.log(error);
  }
};

loadProductDetails = async (req, res) => {
  const login = false;
  try {
    const session = req.session.user_id;

    console.log(req.query.id);

    const product = await produtModel.findById({ _id: req.query.id });

    res.render("productDetails", { product, session, login });
  } catch (error) {
    console.log(error.message);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const userData = await userSchema.findOne({ email: req.body.email });
    const userData1 = await userSchema.findOne({ mobile: req.body.mobile });

    if (userData || userData1) {
      res.render("register", { message: "This Account is already registered" });
    } else {
      newUser = {
        name: req.body.name,
        email: req.body.email,
        dob: req.body.dob,
        mobile: req.body.mobile,
        password: req.body.password,
        isAdmin: false,
      };
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

loadOtp = async (req, res) => {
  try {
    const userData = newUser;
    console.log(userData);
    const mobile = userData.mobile;

    newOtp = message.sendMessage(mobile, res);

    console.log(newOtp);

    res.render("otp", { newOtp, userData });
  } catch {
    console.log(error);
  }
};

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;

    const userData = await userSchema.findOne({ email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAvailable) {
          req.session.user_id = userData._id;
          req.session.user_name = userData.name;
          res.redirect("/");
        } else {
          res.render("login", {
            message: "You are Blocked by the administrator",
          });
        }
      } else {
        res.render("login", { message: "Invalid password" });
      }
    } else {
      res.render("login", { message: "Accout not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const otp = req.body.newotp;
    console.log("verify otp");

    console.log(req.body.otp);

    if (otp === req.body.otp) {
      const password = await bcrypt.hash(req.body.password, 10);
      console.log("opt match");
      console.log(req.body);
      const user = new userSchema({
        name: req.body.name,
        email: req.body.email,
        dob: req.body.dob,
        mobile: req.body.mobile,
        password: password,
        isAdmin: false,
        isAvailable: true,
      });

      console.log("user" + user);

      await user.save().then(() => console.log("register successful"));

      if (user) {
        res.redirect("login");
      } else {
        res.render("otp", { message: "invalid otp" });
      }
    } else {
      console.log("otp not match");
    }
  } catch (error) {
    console.log(error.message);
  }
};

loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const user = await userSchema.findById({ _id: userId });

    const completeUser = await user.populate("cart.item.productId");

    const address = await addressModel.find({ userId: userId });

    res.render("checkout", {
      add: address,
      totalPrice: completeUser.cart.totalPrice,
      session: req.session.user_id,
    });
  } catch {
    console.log(error);
  }
};
const addAddress = async (req, res) => {
  try {
    const userSession = req.session;
    const addressData = addressModel({
      name: req.body.name,
      userId: userSession.user_id,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      mobile: req.body.mobile,
    });

    await addressData.save().then(() => console.log("Address saved"));
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
  }
};

loadOrderSummary = (req, res) => {
  try {
    res.render("ordersummary", {
      session: req.session.user_id,
    });
  } catch {
    console.log(error);
  }
};

const loadForgetPassword = (req, res) => {
  try {
    const session = req.session.user_id;

    res.render("forgetpassword", { login: true, session });
  } catch {
    console.log(error);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const session = req.session.user_id;

    const mobile = req.body.mobile;
    const user = await userSchema.findOne({ mobile: mobile });
    if (user) {
      newOtp = message.sendMessage(mobile, res);
      console.log("Forget tp", newOtp);
      res.render("forgetOtp", { newOtp, userData: user, login: true });
    } else {
      res.render("forgetpassword", { message: "No user found", session });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyForgetPassword = (req, res) => {
  try {
    const otp = req.body.otp;
    const newOtp = req.body.newotp;

    const id = req.body.id;

    if (otp == newOtp) {
      res.render("changePassword", { id, login: true });
    } else {
      res.render("forgetOtp", { id: id, login: true, message: "Invalid OTP" });
    }
  } catch (error) {}
};

const changePassword = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id);

    const userData = await userSchema.findById({ _id: id });

    const newPass = await bcrypt.hash(req.body.password, 1);
    const user = await userSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          password: newPass,
        },
      }
    );

    res.redirect("/login");
  } catch {
    console.log(error);
  }
};

const loadEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;

    console.log("load" + addressId);

    const address = await addressModel
      .findById({ _id: addressId })
      .exec((err, address) => {
        console.log(address);

        res.render("editaddress", {
          address,
          addressId,
          session: req.session.user_id,
          userImage: req.session.userImg,
        });
      });
  } catch {
    console.log(error);
  }
};

const editAddress = async (req, res) => {
  try {
    const addressId = req.body.id;

    console.log(addressId);

    await addressModel
      .findByIdAndUpdate(
        { _id: addressId },
        {
          $set: {
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            mobile: req.body.mobile,
          },
        }
      )
      .then(() => console.log("address updated"));

    res.redirect("/address");
  } catch {
    console.log(error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;

    await addressModel
      .findByIdAndDelete({ _id: id })
      .then(() => console.log("address deleted"));

    res.redirect("/address");
  } catch {
    console.log(error);
  }
};

const placeOrder = async (req, res) => {
  try {
    uuserSession = req.session;
    const addressId = req.body.addressId;
    const address = await addressModel.findById({ _id: addressId });
    const userData = await userSchema
      .findById({ _id: userSession.user_id })
      .populate("cart.item.productId");
  
    let  totalPrice = userData.cart.totalPrice;

      console.log("address", address);

      
        order = await orderModel({
          userId: userSession.user_id,
          payment: req.body.payment,
          name: address.name,
          address: address.address,
          city: address.city,
          state: address.state,
          zip: address.zip,
          mobile: address.mobile,
          products: userData.cart,
          price :totalPrice
        });
        console.log(order);

        req.session.order_id = order._id;

      if (req.body.payment == "cod") {
        console.log("1");
        res.redirect("/orderSuccess");
      } else {
        console.log("2");
        var instance = new RazorPay({
          key_id :process.env.RAZOR_ID,
          key_secret:process.env.RAZOR_secret,
        });
        console.log("1");
        console.log(totalPrice);
        let razorpayOrder = await instance.orders.create({
         
          amount: totalPrice * 100,
          currency: "INR",
          receipt: order._id.toString(),
        });
        console.log();
        console.log("order Order created", razorpayOrder);
        res.render("razorpay", {
          userId: req.session.user_id,
          order_id: razorpayOrder.id,
          total: totalPrice,
          session: req.session,
          key_id  :process.env.RAZOR_ID,
          key_secret : process.env.RAZOR_secret,
          user: userData,
          order: order,
          orderId: order._id.toString(),
        });
        console.log("1");
      }
 
  } catch (error) {
    console.log(error);
  }
};
const loadOrderSuccess = async (req, res) => {
  try {
    if (userSession) {
      await order.save().then(() => {
          userSchema
          .findByIdAndUpdate(
            { _id: req.session.user_id },
            {
              $set: {
                "cart.item": [],
                "cart.totalPrice": "0",
              },
            },
            { multi: true }
          )
          .then(() => {
            console.log("cart deleted");

            // Move the product quantity update code inside this block
            orderModel
              .findById(order._id)
              .populate("products.item.productId")
              .then(async (order) => {
                // decreasing quantity when buying products
                for (const product of order.products.item) {
                  await produtModel.findByIdAndUpdate(
                    product.productId._id,
                    { $inc: { quantity: -product.qty } },
                    { new: true }
                  );
                }
                // updating status if the product quantity is zero

                for (const product of order.products.item) {
                  const products = await produtModel.findById(
                    product.productId._id
                  );

                  if (products.quantity == 0) {
                    await productModel.findByIdAndUpdate(
                      product.productId._id,
                      {
                        $set: {
                          isAvailable: 0,
                        },
                      }
                    );
                  }
                }
              });

              
          });
          
      });
    
      const productDetails = await produtModel.find({ is_available: true});
      for (let i = 0; i < productDetails.length; i++) {
        for (let j = 0; j < order.products.item.length; j++) {
          if (
            productDetails[i]._id.equals(order.products.item[j].productId)
          ) {
            productDetails[i].sales += order.products.item[j].qty;
          }
        }
        productDetails[i].save();
      }

      res.render("orderSuccess", { session: req.session.user_id });
    }
  } catch (error) {}
};

const loadOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(userId);
    await userSchema.findById({ _id: userId });

    orderDetails = await orderModel
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .exec((err, data) => {
        res.render("ordersummary", {
          session: req.session.user_id,
          order: data,

          userImage: req.session.userImg,
        });
      });
  } catch {
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    console.log("1");

    const orderData = await orderModel.findById(req.query.id);
    const productData = await productModel.find();

    // Retrieve the order details and populate the product field with the corresponding product documen

    for (let key of orderData.products.item) {
      for (let prod of productData) {
        console.log(key.productId);
        if (new String(prod._id).trim() == new String(key.productId).trim()) {
          prod.quantity = prod.quantity + key.qty;
          await prod.save();
        }
      }
    }

    await orderModel.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          status: "Cancel",
        },
      }
    );
    console.log("cancelled order");
    res.redirect("/OrderDetails");
  } catch {
    console.log(error.message);
  }
};

const returnOrder = async (req, res) => {
  try {
    console.log("1");
    await orderModel.findOneAndUpdate(
      { _id: req.query.id },
      {
        $set: { status: "Returnreq" },
      }
    );
    console.log("cancelled order");
    res.redirect("/OrderDetails");
  } catch {
    console.log(error.message);
  }
};

const viewOrders = async (req, res) => {
  try {
    console.log("viewing");
    userSession = req.session;

    const order = await orderModel.findOne({ _id: req.query.id });
    console.log(req.query.id);
    const userData = await userSchema.findById({ _id: userSession.user_id });

    const completeData = await order.populate("products.item.productId");
    console.log(order);
    console.log();
    res.render("orderDetails", {
      order: completeData.products.item,
      user: userData,
      orders: order,
    });
  } catch {
    console.log(error);
  }
};

const loadUserProfile = async (req, res) => {
  try {
    const session = req.session;

    userSchema.findById({ _id: session.user_id }).exec((err, user) => {
      res.render("userProfile", { user, session: req.session.user_id });
    });
  } catch {
    console.log(error.message);
  }
};

const loadEditUserProfile = async (req, res) => {
  try {
    const session = req.session;

    userSchema.findById({ _id: session.user_id }).exec((err, user) => {
      res.render("editUserProfile", { user, session });
    });
  } catch {
    console.log(error);
  }
};

const editUserProfile = async (req, res) => {
  console.log(req.body);
  const id = req.session.user_id;
  await userSchema
    .findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          dob: req.body.dob,
          // mobile :req.body.mobile,
          // email: req.body.email
        },
      }
    )
    .then((user) => {
      // req.session.userImg = user.image;
      // console.log(user.image);
      res.redirect("userProfile");
    })
    .then(() => console.log("edited"));
};

const payment = async (req, res) => {
  userSession = req.session;
  const userData = await userSchema.findById({ _id: userSession.user_id });
  const completeUser = await userData.populate("cart.item.productId");
  var instance = new RazorPay({
    key_id  :process.env.RAZOR_ID,
    key_secret : process.env.RAZOR_secret
  });

  console.log(completeUser.cart.totalPrice);
  let myOrder = await instance.orders.create({
    amount: completeUser.cart.totalPrice * 100,
    currency: "INR",
    receipt: "receipt#1",
  });

  console.log(myOrder);

  if (res.status(201)) {
    res.json({ status: "success" });
  } else {
    res.json({ status: "success" });
  }
};

const orderFailed = async (req, res) => {
  try {
    res.render("paymentFailed");
  } catch (error) {
    console.log(error.message);
  }
};

const addCouponValue = async (req, res) => {
  try {
    const totalPrice = req.body.totalValue;
    console.log("total12" + totalPrice);
    userdata = await userSchema.findById({ _id: userSession.user_id });
    offerdata = await offermodel.findOne({ name: req.body.coupon });
    console.log("fghdj");
    if (offerdata) {
      console.log("p333");
      console.log(offerdata.expiryDate, Date.now());
      const date1 = new Date(offerdata.expiryDate);
      const date2 = new Date(Date.now());
      if (date1.getTime() > date2.getTime()) {
        console.log("p4444");
        if (offerdata.usedBy.includes(userSession.user_id)) {
          message = "coupon already used";
          console.log(message);
        } else {
          console.log("eldf");
          console.log(
            userdata.cart.totalPrice,
            offerdata.maxAmount,
            offerdata.minAmount
          );
          if (
            userdata.cart.totalPrice <= offerdata.maxAmount &&
            userdata.cart.totalPrice >= offerdata.minAmount
          ) {
            console.log("COMMING");
            console.log("offerdata.name");
            await offermodel.updateOne(
              { name: offerdata.name },
              { $push: { usedBy: userdata._id } }
            );
            console.log("kskdfthg");
            fol = totalPrice;
            disc = (offerdata.discount * totalPrice) / 100;
            if (disc > offerdata.maxAmount) {
              disc = offerdata.max;
            }
            console.log("dic" + disc);
            jol = fol - disc;
            console.log("jol" + jol);
            console.log("fol" + fol);
            res.send({ disc, state: 1, fol, jol });
          } else {
            message = "cannot apply";
            res.send({ message, state: 0 });
          }
        }
      } else {
        message = "coupon Expired";
        res.send({ message, state: 0 });
      }
    } else {
      message = "coupon not found";
      res.send({ message, state: 0 });
    }
  } catch (error) {
    console.log(error);
  }
};
// const addCouponValue = async (req, res) => {
//   const totalPrice = req.body.totalValue;
//   console.log("total12" + totalPrice);

//   try {
//     userSession = req.session;
//     if (userSession.user_id) {
//       const userdata = await userSchema.findById({ _id: userSession.user_id });
//       const offerdata = await offermodel.findOne({ name: req.body.coupon });
//       if (offerdata) {
//         if (offerdata.expiryDate < Date.now()) {
//           // req.flash('passed',{error:'Coupon is expired'})
//           res.status(404).json({ error: "coupon expires" });
//           res.redirect("/checkout");
//         }
//         if (offerdata.usedBy.includes(userSession.user_id)) {
//           nocoupon = true;
//           // res.redirect('/loadusercheckout');
//         } else {
//           if (
//             userdata.cart.totalPrice < offerdata.maxAmount &&
//             userdata.cart.totalPrice > offerdata.minAmount
//           ) {
//             let updatedTotal = totalPrice - (totalPrice * offerdata.discount)/100;
//                     userSession.coupontotal = updatedTotal;
//                    let discount = offerdata.discount;
//                    await offerdata.updateOne({ name: offerdata.name }, { $push: { usedBy: userSession.user_id } });

//                     res.json({ updatedTotal,discount});

//             // res.redirect("/checkout");
//           } else {
//             //  let discount = offerdata.discount;
//             //  await offerdata.updateOne({ name: offerdata.name }, { $push: { usedBy: userSession.user_id } });
//             let updatedtotal = userdata.cart.totalPrice;
//             userSession.coupontotal = updatedtotal;
//             totalPrice=updatedtotal
//             res.status(404).json({ error: "coupon didnt meet the criteria" });
//             // res.redirect('/loadusercheckout')
//             // res.redirect("/checkout");
//           }
//           // res.redirect("/checkout");
//         }
//       } else {
//         // res.redirect("/checkout");
//       }
//     } else {
//       // res.redirect("/cart");
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const loadAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const user = await userSchema.findById({ _id: userId });

    const address = await addressModel.find({ userId: userId });
    res.render("loadAddress", {
      add: address,
      session: req.session.user_id,
      userImage: req.session.userImg,
    });
  } catch {
    console.log(error);
  }
};

module.exports = {
  returnOrder,
  loadAddress,
  addCouponValue,
  payment,
  viewOrders,
  editUserProfile,
  loadEditUserProfile,
  loadUserProfile,
  loadOrderDetails,
  cancelOrder,
  placeOrder,
  deleteAddress,
  changePassword,
  verifyForgetPassword,
  loadForgetPassword,
  forgetPassword,
  addAddress,
  loadOrderSummary,
  loadOrderSuccess,
  loadCheckout,
  registerUser,
  loadProductDetails,
  loadHome,
  loadContact,
  loadProduct,
  loadCart,
  loadShop,
  loadLogin,
  loadCart,
  verifyLogin,
  loadOtp,
  verifyOtp,
  loadEditAddress,
  editAddress,
  addToCart,
  deleteCart,
  addCartDeleteWishlist,
  addToWishlist,
  deleteWishlist,
  loadUserProfile,
  loadRegister,
  loadWishlist,
  editCart,
  orderFailed,
};
