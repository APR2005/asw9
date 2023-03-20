const express = require("express");
const app = express();
const path = require("path");
const hbs = require("express-handlebars");
// const mongoose = require("mongoose");
const mongoose = require("mongoose");
const nocache = require("nocache");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
// routes setup
const userRouter = require("./routes/userRouter");
const moment = require('moment');
const adminRouter = require("./routes/adminRouter");
PORT=process.env.PORT;
require('dotenv').config()
// setting up view engine for user routes

userRouter.set("views", path.join(__dirname, "views/user"));
userRouter.set("view engine", "hbs");
app.use(nocache())
app.engine( 
  "hbs",
  hbs.engine({
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "userLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
    helpers:{
      limit:function(ary, max, options) {
        if(!ary || ary.length == 0)
            return options.inverse(this);
    
        var result = [ ];
        for(var i = 0; i < max && i < ary.length; ++i)
            result.push(options.fn(ary[i]));
        return result.join('');
    },
    inc:function(value,options){
      return parseInt(value) + 1
    },
    eq:function(v1, v2) {
      if(v1 == v2) {
        return  v2
      }
      else{
        

      }
    },
     math:function(lvalue,operator,rvalue,optons){
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];


     },
      formatDate: function(date, format) {
        const dateFormat = typeof format === 'string' ? format :"MMM  Do  YYYY";
        return moment(date).format(dateFormat);
    },
    shouldDisableReturnButton : function(deliveryDateStr) {
      const deliveryDate = new Date(deliveryDateStr);
      const disableDate = new Date(deliveryDate.getTime() + (1* 24 * 60 * 60 * 1000));
      const currentDate = new Date();
      return currentDate > disableDate;
    }


    }
  })
);
// setting up view engine for admin routes
adminRouter.set("views", path.join(__dirname, "views/admin"));
adminRouter.set("view engine", "hbs");
adminRouter.engine(
  "hbs",
  hbs.engine({ 
    extname: "hbs",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: "adminLayout",
    layoutsDir: __dirname + "/views/layout",
    partialsDir: __dirname + "/views/partials",
    helpers:{
      inc:function(value,options){
        return parseInt(value) + 1
      },limit:function(ary, max, options) {
        if(!ary || ary.length == 0)
            return options.inverse(this);
    
        var result = [ ];
        for(var i = 0; i < max && i < ary.length; ++i)
            result.push(options.fn(ary[i]));
        return result.join('');
    },
    eq:function(v1, v2) {
      if(v1 == v2) {
        return  v2
      }
      else{
        

      }
    },

    math:function(lvalue,operator,rvalue,optons){
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];


     },
     
      formatDate: function(date, format) {
        const dateFormat = typeof format === 'string' ? format : 'MMM Do YYYY';
        return moment(date).format(dateFormat);
    }
     



    

    }
  })
);

// setting up static files
userRouter.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public/admin")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/admin", adminRouter);



// database connection

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGODB_CONNECT, () =>
  console.log("Database connection established")
);

const hbss = hbs.create({
   
});
app.set('view engine', 'hbs');  



//  app.use((err,req,res,next)=>{
//    res.status(500).send("Something Broke!");
// });

app.use((req,res,next)=>{
  res.status(404).render('admin/404')
})

app.use((err,req,res,next)=>{
  res.status(500).render('admin/404')
})

 
app.listen(PORT, () => {
  console.log(`SERVER RUNNING AT PORT:${PORT}`); 
});
                  