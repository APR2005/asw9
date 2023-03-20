const express = require("express");

const router = express();

const adminController = require("../controller/adminController");

const config = require("../config/config");

const session = require("express-session");

const adminAuth = require("../middleWares/adminAuth");

const nocache = require("nocache");
const { route } = require("./userRouter");
const multer = require("../util/multer");

router.use(nocache());

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//session
router.use(
  session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: config.maxAge,
    },
  })
);

router.get("/", adminAuth.isLogin, adminController.loadLogin);

router.get("/products", adminAuth.isLogout, adminController.loadProduct);

router.get("/addProducts", adminAuth.isLogout, adminController.loadAddProduct);

router.get("/users", adminAuth.isLogout, adminController.loadUsers);

router.get("/dashboard", adminAuth.isLogout, adminController.loadDashboard);


router.get("/logout", adminAuth.logout);

router.get("/editProduct", adminController.loadEditProduct);

router.get("/block", adminController.blockUser);

router.get("/stock", adminController.inStock);

router.get("/category", adminController.loadCategory);

router.get("/delteCategory", adminController.deleteCategory);


router.get('/order',adminAuth.isLogout, adminController.loadOrder)

router.get('/cancelOrder',adminAuth.isLogout, adminController.cancelorder)

router.get('/confirmOrder',adminAuth.isLogout, adminController.ConfirmOrder)

router.get('/deliOrder',adminAuth.isLogout, adminController.deliOrder)

router.get('/returnOrder',adminAuth.isLogout, adminController.returnOrder)

router.get('/viewOrder',adminAuth.isLogout, adminController.viewOrder)

router.get('/offerStore',adminController.offer)

router.get('/deleteOffer',adminController.deleteOffer)

router.get("/deleteBanner",adminController.deleteBanner)

router.get('/stockReport',adminController.stockReport)
router.get('/salesReport',adminController.salesReport)
router.get('/loadfullSales',adminController.loadfullSales)
router.get('/download',adminController.adminDownload)
router.get('/loadBanner',adminController.loadBanner)
router.get('/rest',adminController.activeB)
router.get('/active',adminController.activeB)

// post


router.post(
  "/offerStore",
  adminController.offerStore
);

router.post(
  "/addCategory",
  adminController.addCategory,
  adminController.loadCategory
);

router.post("/", adminController.verifyLogin);

router.post(
  "/addCategory",
  adminController.addCategory,
  adminController.loadCategory
);

router.post(
  "/addProducts",adminAuth.isLogout,
  multer.upload.array("images"),
  adminController.addProduct,
  adminController.loadAddProduct
);

router.post('/MonthlySales',adminController.monthlysales)

router.post('/datewiseReport',adminController.datewiseReport)


router.post("/update", multer.upload.array("images"), adminController.editProduct);

router.post('/addBanner',multer.upload.array('bannerImage'),adminController.addBanner)


module.exports = router;
