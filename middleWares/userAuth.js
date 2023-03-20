const userModel = require("../model/userModel");

const isLogin = (req, res, next) => {
  try {
    if (req.session.user_id) {
      res.render("home");
    } else {      
      next();
    }
  } catch (error) {
    console.log("error.message");
  }
};

const isLogout = async (req, res, next) => {
  try {
const userdata = await userModel.findById({_id:req.session.user_id})

    if (req.session.user_id && userdata.isAvailable) {
    
      next();
    } else {
      res.render("login",{login:true,});
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = (req, res, next) => {
  try {
    if ((req, res)) {
      req.session.destroy();
      res.redirect("/");
    } 
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isLogin,
  isLogout,
  logout,
};
