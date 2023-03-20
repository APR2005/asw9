const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const productModel = require("../model/productModel");
const path = require("path");
const multer = require("multer");
const categoryModel = require("../model/categoryModel");
const e = require("express");
const Banner = require("../model/bannerModel")
const exceljs = require('exceljs')

const Order = require("../model/orderModel");
const offerModel = require("../model/offermodel");
const orderModel = require("../model/orderModel");
const upload = require("../util/multer");
const { error } = require("console");
const moment = require("moment")
// !--------------multer-------------------------------------------


// !----------------------------------------------------------------

let isAdminLoggedin
isAdminLoggedin = false
let adminSession = false

// get meathodes
// loadDashboard = (req, res) => {
//   try{
//   res.render("dashboard");
//   }
//   catch{
//     console.log(error);
//   }
// };

loadProduct = async (req, res) => {
  try{
   productData = await productModel.find({}).exec((err, product) => {
    if (product) {
      res.render("product", { product });
    } else {
      res.send("404 page not found");
    }
  });   
}
 catch{
  console.log(error);
 }
};

loadAddProduct = async (req, res) => {
  try {
    categoryModel.find({}).exec((err, category) => {
      res.render("addProduct", { category });
    });
  } catch (error) {
    console.log(error.message);
  }
};
loadUsers = (req, res) => {
  try{
  const userData = userModel.find({}).exec((err, user) => {
    if (user) {
      res.render("users", { user });
    } else {
      res.render("users");
    }
  });
}
  catch{
    console.log(error);
  }
};

loadLogin = (req, res) => {
  try{
  const logout = true;
  res.render("login", { logout });
  }
   catch{
    console.log(error);
   }
};

// post meathode

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;

    const userData = await userModel.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        userData.password
      );

      if (passwordMatch) {
        if (userData.isAdmin) {
          req.session.admin_id = userData._id;
          req.session.admin_name = userData.name;

          res.redirect("/admin/dashboard");
        } else {
          res.render("login", {
            message: "You are not an administrator",
            logout: true,
          });
        }
      } else {
        res.render("login", { message: "password is invalid", logout: true });
      }
    } else {
      res.render("login", { message: "Account not found", logout: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addProduct = async (req, res, next) => {
  try {
    console.log(req.files);
    const images = req.files;

    const product = new productModel({
      name: req.body.product,
      category: req.body.category,
      price: req.body.price,
      image: images.map((x) => x.filename),
      quantity: req.body.qty,
      description: req.body.description,
      isAvailable: true,
    });

    await product.save().then(() => console.log("Product Saved"));

    next();
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = (req, res) => {
  try {

    productModel.findById({ _id: req.query.id }).exec((err, product) => {
      if (product) {
        res.render("editProduct", { product });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const images = req.files
    console.log(images);
  
    await productModel
      .findByIdAndUpdate(
        { _id: req.body.ID },
        {
          $set: {
            name: req.body.name,
            category: req.body.category,
            image: images.map((x) => x.filename),
            price: req.body.price,
            description: req.body.description,
          },
        }
      )
      .then(() => {
        res.redirect("/admin/products");
      });
  } catch (error) {
    console.log(error.message);
  }
};

const blockUser = async (req, res, next) => {
  try{
  const userData = await userModel.findById({ _id: req.query.id });

  if (userData.isAvailable) {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: false,
        },
      }
    );
  } else {
    await userModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: true,
        },
      }
    );
  }
  res.redirect("/admin/users");
}
 catch{
  console.log(error);
 }
};

const inStock = async (req, res) => {
  try{
  const product = await productModel.findById({ _id: req.query.id });
  console.log();

  if (product.isAvailable) {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: false,
        },
      }
    );
  } else {
    await productModel.findByIdAndUpdate(
      { _id: req.query.id },
      {
        $set: {
          isAvailable: true,
        },
      }
    );
  }

  res.redirect("/admin/products");
}
  catch{
    console.log(error);
  }
};

addCategory = async (req, res, next) => {
  try{
  const category = await categoryModel.findOne({ name: req.body.name });

  if (!category) {
    const category = new categoryModel({
      name: req.body.name,
    });

    await category.save().then(() => {
      console.log("category saved successfully");
    });

    next();
  } else {
    res.redirect("/admin/category");
  }
}
 catch{
  console.log(error);
 }
};

const unlistProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await productModel.updateOne({ _id: id }, { $set: { isAvailable: false } });

    console.log("product id " + id);
    res.redirect("/admin/adminProduct");
  } catch (error) {
    console.log(error.message);
  }
};

const listProduct = async (req, res) => {
  try {
    const id = req.query.id;
    await productModel.updateOne({ _id: id }, { $set: { isAvailable: true } });
    res.redirect("/admin/adminProduct");
    console.log(id);
  } catch (error) {
    console.log(error.message);
  }
};

addCategory = async (req, res, next) => {
   try{
  const category = await categoryModel.findOne({ name: req.body.name });
  if (!category) {
    const category = new categoryModel({
      name: req.body.name,
    });
    await category.save().then(() => {
      console.log("category saved sucessfully");
    });
    next();
  } else {
    res.redirect("/admin/category");
  }
}
 catch{
  console.log(error);
 }
};

loadCategory = async (req, res) => {
  try{
  categoryModel.find({}).exec((err, category) => {
    if (category) {
      res.render("category", { category });
    } else {
      console.log("no category found");
    }
  });
}
 catch{
  console.log(error);
 }
};

deleteCategory = async (req, res) => {
  try{
  await categoryModel.findByIdAndDelete({ _id: req.query.id });

  res.redirect("/admin/category");
  }
   catch{
    console.log(error);
   }
};

const viewOrder = async (req, res) => {
try{



  const order = await orderModel.findById({ _id: req.query.Id });

  const completeData = await order.populate("products.item.productId");


  res.render("orderList", {
    order: completeData.products.item,
    session: req.session.user_id,
  });
}
 catch{
  console.log(error);
 }

}

const cancelorder = async (req, res) => {


  const orderData = await orderModel.findById(req.query.id)
  const productData = await productModel.find()

  // Retrieve the order details and populate the product field with the corresponding product documen

  for (let key of orderData.products.item) {
    for (let prod of productData) {
        console.log(key.productId);
        if (new String(prod._id).trim() == new String(key.productId).trim()) {
            prod.quantity = prod.quantity + key.qty
            await prod.save()
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
  res.redirect("/admin/order");
};

const offer = async (req, res) => {
  try {
    const offerdata = await offerModel.find()
    
  
    console.log(offerdata.expiryDate)
    
    

        res.render('offer',{offer:offerdata })
  } catch (error) {
    console.log(error.message);
  }   
};
const offerStore  = async (req, res) => {

  try {
    const offer = offerModel ({
      name:req.body.name,
      type:req.body.type,
      discount:req.body.discount,
      minAmount: req.body.minAmount,
      maxAmount: req.body.maxAmount,
       expiryDate: req.body.expiryDate


    
  })
  await offer.save()

  res.redirect('/admin/offerStore')   
  } catch (error) {
    console.log(error.message);
  }   
};
const returnOrder = async (req, res) => {
  try {
    const orderData = await orderModel.findById(req.query.id)
    const productData = await productModel.find()

    for (let key of orderData.products.item) {
      for (let prod of productData) {
          console.log(key.productId);
          if (new String(prod._id).trim() == new String(key.productId).trim()) {
              prod.quantity = prod.quantity + key.qty
              await prod.save()
          }
      }
   }


    await orderModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { status: "Return" } }
    );

    res.redirect('/admin/order');
  } catch (error) {
    console.log(error);
  }
};

const cancelOrder = async (req, res) => {
  try{
      


  await orderModel.findOneAndUpdate(
    { _id: req.query.id },
    {
      $set: {
        status: "Cancel",
      },
    }
  );
  console.log("cancelled order");
  res.redirect("/admin/order");
}
 catch{
  console.log(error);
 }
};
const loadOrder = async (req, res) => {
  

  const order = await orderModel.find({}).sort({ createdAt: -1 }).populate("userId");
  
  if (req.query.id) {
    id = req.query.id;
    console.log(id);

    res.render("orders", { order, id: id });
  } else {
    res.render("orders", { order });
  }

};

const ConfirmOrder = async (req, res) => {
  try{
  await orderModel.findByIdAndUpdate(
    { _id: req.query.id },
    { $set: { status: "Confirm" } }
  )
  res.redirect('/admin/order')
  }
    catch{
      console.log(error);
    }
};

const deliOrder = async (req, res) => {
  try {
    const deliveryDate = Date.now()
    await orderModel.findByIdAndUpdate(
      { _id: req.query.id },
      { $set: { status: "Delivered", deliveryDate: deliveryDate } }
    );
     console.log(deliveryDate);
     console.log("1");
    res.redirect('/admin/order');
  } catch(error) {
    console.log(error);
  }
}
const deleteOffer = async(req,res)=>{
  try {
      const id = req.query.id;
      await offerModel.deleteOne({_id:id});
      res.redirect('/admin/offerStore')
  } catch (error) {
      console.log(error.message);
  }
}
const loadDashboard = async (req, res) => {
  try {
   
    if (req.session.admin_id) {
      console.log(req.session.admin_id);
      isAdminLoggedin=true;
      const productData = await productModel.find()
      const userData = await userModel.find({ is_admin: 0 })
      const adminData = await userModel.findOne({is_admin:1})
      const categoryData = await categoryModel.find()

      const categoryArray = [];
      const orderCount = [];
      for(let key of categoryData){
        categoryArray.push(key.name)
        orderCount.push(0)
    }
    const completeorder = []
    const orderData =await orderModel.find()
    for(let key of orderData){
      const uppend = await key.populate('products.item.productId')
      completeorder.push(uppend)
  }

  const productName =[];
  const salesCount = [];
  const productNames = await productModel.find();
  for(let key of productNames){ 
    
    productName.push(key.name);
    salesCount.push(key.sales)
    console.log(key.sales);
  }
  for(let i=0;i<completeorder.length;i++){
    for(let j = 0;j<completeorder[i].products.item.length;j++){
       const cataData = completeorder[i].products.item[j].productId.category
       const isExisting = categoryArray.findIndex(category => {
        return category === cataData
       })
       orderCount[isExisting]++
}}

  const showCount = await orderModel.find().count()
  const productCount = await productModel.count()

  const usersCount = await userModel.count({is_admin:false})
  const totalCategory = await categoryModel.count({isAvailable:true})
  console.log(productCount);

console.log(categoryArray);
console.log(orderCount);

    res.render('dashboard', {
      users: userData,
      admin: adminData,
      product: productData,
      category: categoryArray,
      count: orderCount,
      pname:productName,
      pcount:salesCount,
      showCount,
      productCount,
      usersCount,
      totalCategory
      
    });
      
    } else {
      res.redirect('/admin/adminLogin')
    }
  } catch (error) {
    console.log(error.message)
  }
}


const stockReport = async(req,res)=>{
  try {
      const productdata = await productModel.find()
      res.render('stockReport',{
          product:productdata,
          admin:true
      })
  } catch (error) {
      console.log(error.message);  
  }
}


const salesReport = async(req,res)=>{
  try {
    console.log("1");
      const productdata = await productModel.find()
      console.log(productdata);
      
      res.render('salesReport',{products:productdata})

  } catch (error) {
      console.log(error.message);
  }
}

const monthlysales = async(req,res)=>{
  try {
      const month = req.body.month;
      // const endate = req.body.Endingdate;
      const startofmonth = new Date(month);
      const endofmonth = new Date(month);
      console.log(startofmonth);
      endofmonth.setMonth(endofmonth.getMonth()+1);
      const sales = await orderModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: startofmonth,
                $lte: endofmonth,
              },
              status: 'Delivered', // Only count completed orders
            },
          },
          {
            $unwind: '$products.item',
          },
          {
            $group: {
              _id: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
                productId: '$products.item.productId',
              },
              quantity: { $sum: '$products.item.qty' },
              totalSales: { $sum: '$products.item.price' },
            },
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id.productId',
              foreignField: '_id',
              as: 'product',
            },
          },
          {
            $project: {
              _id: 0,
              month: '$_id.month',
              year: '$_id.year',
              productId: '$_id.productId',
              name: '$product.name',
              category: '$product.category',
              quantity: 1,
              totalSales: 1,
            },
          },
        ])
      // console.log(sales);
      res.render('monthlySales',{sales:sales})
      
  } catch (error) {       
      console.log(error.message);
  }
}


const datewiseReport = async(req,res)=>{
  try {
      const startdate = new Date(req.body.Startingdate)
      const enddate = new Date(req.body.Endingdate)

      // console.log(startdate);

      // const orders = await Order.find({createdAt:{$gte:startdate}})
      // console.log(orders);
      const sales = await orderModel.aggregate([
          {
              $match:{
                  createdAt:{
                      $gte: startdate,
                      $lt: enddate
                  },
                  status:'Delivered',
              },
          },
          {
              $unwind:'$products.item',
          },
          {
              $group:{
                  _id:'$products.item.productId',
                  totalSales:{ $sum: '$products.item.price'},
                  quantity:{ $sum: '$products.item.qty'}
              },
          },
          {
              $lookup:{
                  from:'products',
                  localField:'_id',
                  foreignField:'_id',
                  as:'product'
              },
          },
          {
              $unwind:'$product',
          },
          {
              $project:{
                  _id:0,
                  name:'$product.name',
                  category:'$product.category',
                  price:'$product.price',
                  quantity:'$quantity',
                  sales:'$totalSales'
              },
          },
      ])
      // console.log(sales);
      res.render('datewisereport',{sales:sales});
  } catch (error) {
      console.log(error.message);
  }
}



const loadfullSales = async(req,res)=>{
  try {
      res.render('ALLSales')
  } catch (error) {
      console.log(error.message)
  }
}



const adminDownload= async(req,res)=>{
  try {
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet("Stockreport")

      worksheet.columns = [
          { header:"Sl no.",key:"s_no" },
          { header:"Product",key:"name" },
          { header:"Category",key:"category" },
          { header:"Price",key:"price" },
          { header:"Quantity",key:"quantity" },
          { header:"Rating",key:"rating" },
          { header:"Sales",key:"sales" },
          { header:"isAvailable",key:"isAvailable" },
      ];

      let counter = 1;

      const productdata = await productModel.find()

      productdata.forEach((product)=>{
          product.s_no = counter;
          worksheet.addRow(product)
          counter++;
      })

      worksheet.getRow(1).eachCell((cell)=>{
          cell.font = {bold:true}
      });

      res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      res.setHeader("Content-Disposition","attachment; filename=products.xlsx")   
      
      return workbook.xlsx.write(res).then(()=>{
          res.status(200)
      })

  } catch (error) {
      console.log(error.message);
  }
}

// ------------------------------------------Banner---------------------------------------

  const loadBanner = async(req,res)=>{
    try{
        const bannerdata = await Banner.find()
        res.render('banner',{banners:bannerdata})
    }
    catch{
      console.log(error.message);
    }
  }

  const addBanner = async (req,res)=>{
    try{
      console.log("1");
       const newBanner = req.body.banner;
       console.log(2);
       const file =req.files;
       console.log(3);
       const banner = new Banner({
          banner :newBanner,
          bannerImage:file.map((x)=>x.filename)
       })
       console.log(4);
       const bannerdata = await banner.save();
       if(bannerdata){
        console.log(5);
        res.redirect('/admin/loadBanner')
       }

    }
    catch{
     console.log(error.message);
    }
  }
  const activeBanner = async(req,res)=>{
    try{
       const id = req.query.id
       await Banner.findOneAndUpdate({is_active:1},{$set:{is_active:0}})
       await Banner.findOneAndUpdate({id:id},{$set:{is_active:1}})
       res.redirect('/admin/loadBanner')


    }
    catch{
      console.log(error.message);
    }
  }

  const restbanner = async(req,res)=>{
    try{
        const id = req.query.id
        await Banner.findOneAndUpdate(
          {id:id},{
          $set :{is_active:0}
        })
        res.redirect('/admin/loadBanner')
    }
    catch{
      console.log(error.message);
    }
  }
  
  const deleteBanner = async(req,res)=>{
    try{
      const id = req.query.id;
      await Banner.deleteOne({_id:id});
      res.redirect('/admin/loadBanner')

    }
    catch{
      console.log(error.message);
    }
      

  }
  const activeB = async (req, res) => {
    try {
      const bannerId = req.query.id;
      const banner = await Banner.findById(bannerId);
    
      // Deactivate other banners
      await Banner.updateMany({ _id: { $ne: bannerId } }, { $set: { is_active: false } });
      
      // Activate the clicked banner
      await Banner.findByIdAndUpdate(bannerId, { $set: { is_active: true } });
  
      res.redirect('/admin/loadBanner');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  

module.exports = {

adminDownload,
loadDashboard,
  deleteOffer,
  offerStore,
  offer,
  cancelorder,
  loadCategory,
  deleteCategory,
  addCategory,
  listProduct,
  unlistProduct,
  inStock,
  blockUser,
  loadDashboard,
  loadProduct,
  loadAddProduct,
  loadUsers,
  loadLogin,
  verifyLogin,
  addProduct,
  editProduct,
  loadEditProduct,
  viewOrder,
  returnOrder,
  loadOrder,
  ConfirmOrder,
  deliOrder,
  stockReport,
  salesReport,
  monthlysales,
  datewiseReport,
  loadfullSales,
  loadBanner,
  addBanner,
  activeBanner,
  restbanner,
  deleteBanner,
    activeB


};
