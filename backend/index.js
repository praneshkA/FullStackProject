const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const port = 4000;
const secretKey = "your_secret_key";

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://pranesh:12345@cluster0.3b7tk9u.mongodb.net/e-commerce?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

const uploadDir = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const Storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: Storage });
app.use("/images", express.static(uploadDir));

// ---------- MODELS ----------
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }]
});

const ProductItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  number: String,
  products: [ProductItemSchema],
  address: String,
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  totalAmount: Number,
  paymentMode: { type: String, enum: ['COD', 'UPI', 'Card', 'Mock'], default: 'COD' },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  category: String,
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", OrderSchema);

// ---------- ROUTES ----------
app.get("/api", (req, res) => res.send("Express API is running"));

app.get("/api/allproducts", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/products/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json(product);
  } catch {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// AUTH ROUTES
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ success: false, message: "Invalid password" });

  const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: "1h" });
  res.json({ success: true, token, userId: user._id });
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();

  const token = jwt.sign({ userId: newUser._id }, secretKey, { expiresIn: "1h" });
  res.json({ success: true, token });
});

// UPLOAD PRODUCT IMAGE
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const fileUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  res.json({ success: true, image_url: fileUrl });
});

app.post("/api/addproduct", upload.single("image"), async (req, res) => {
  const { name, category, new_price, old_price } = req.body;
  if (!name || !category || !new_price || !old_price || !req.file)
    return res.status(400).json({ success: false, message: "All fields are required" });

  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  const lastProduct = await Product.findOne().sort({ id: -1 });
  const newProduct = new Product({
    id: lastProduct ? lastProduct.id + 1 : 1,
    name,
    category,
    new_price,
    old_price,
    image: imageUrl
  });

  await newProduct.save();
  res.status(201).json({ success: true, product: newProduct });
});

app.post("/removeproduct", async (req, res) => {
  const { id } = req.body;
  const deleted = await Product.findOneAndDelete({ id });
  if (!deleted) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product removed" });
});

// ---------- CART ROUTES ----------
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided" });
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: "Token invalid" });
    req.userId = decoded.userId;
    next();
  });
};

app.get('/api/cart', verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).populate('cart.productId');
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ cart: user.cart });
});

app.post('/api/cart/add', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const user = await User.findById(req.userId);
  const product = await Product.findById(productId);
  if (!user || !product) return res.status(404).json({ success: false, message: "User or product not found" });

  const item = user.cart.find(item => item.productId.toString() === productId);
  if (item) item.quantity += quantity;
  else user.cart.push({ productId, quantity });

  await user.save();
  res.json({ success: true, message: "Product added to cart" });
});

app.post('/api/cart/remove', verifyToken, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const user = await User.findById(req.userId);
  const index = user.cart.findIndex(item => item.productId.toString() === productId);
  if (index === -1) return res.status(404).json({ success: false, message: "Item not in cart" });

  if (user.cart[index].quantity <= quantity) user.cart.splice(index, 1);
  else user.cart[index].quantity -= quantity;

  await user.save();
  res.json({ success: true, message: "Item removed from cart" });
});

// ---------- ORDER ROUTES ----------
app.post('/api/order', verifyToken, async (req, res) => {
  const { name, number, products, address, totalAmount, paymentMode } = req.body;
  if (!name || !number || !products || !address || !totalAmount || !paymentMode)
    return res.status(400).json({ success: false, message: "Missing fields" });

  const order = new Order({ userId: req.userId, name, number, products, address, totalAmount, paymentMode });
  await order.save();
  res.status(201).json({ success: true, order });
});

app.get('/api/my-orders', verifyToken, async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ orders });
});

// ---------- DEFAULT ROUTES ----------
app.get("/allproducts", (req, res) => res.redirect("/api/allproducts"));
app.get("/products/:category", (req, res) => res.redirect(`/api/products/${req.params.category}`));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../frontend/build", "index.html")));
} else {
  app.get("/", (req, res) => res.send("Express API server running"));
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
