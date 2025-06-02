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

mongoose
  .connect("mongodb+srv://pranesh:12345@cluster0.3b7tk9u.mongodb.net/e-commerce?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

const uploadDir = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const Storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: Storage });

app.use("/images", express.static(uploadDir));

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    }
  ]
});

// models/Order.js

const ProductItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String, // snapshot of name at order time
  price: Number, // snapshot of price at order time
  quantity: {
    type: Number,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { 
    type: String,
    required: true
  },
  number: { 
    type: String,
    required: true
  },
  products: [ProductItemSchema],
  address: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['COD', 'UPI', 'Card', 'Mock'],
    default: 'COD'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Order', OrderSchema);


const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const Product = mongoose.model("Product", productSchema);

app.get("/api", (req, res) => {
  res.send("Express API is running");
});

app.get("/api/allproducts", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/products/:category", async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid password" });
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: "1h" });
    res.json({ success: true, message: "Login successful", token, userId: user._id });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ success: false, message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id, email: user.email }, secretKey, { expiresIn: "1h" });
    res.json({ success: true, message: "User registered successfully", token });
  } catch (error) {
    console.error("Error in signup:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Upload Single Product Image
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const fileUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  res.status(200).json({ success: true, image_url: fileUrl });
});

// Upload Multiple Images


// ✅ Actual Add Product Endpoint
app.post("/api/addproduct", upload.single("image"), async (req, res) => {
  try {
    const { name, category, new_price, old_price } = req.body;

    if (!name || !category || !new_price || !old_price || !req.file) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;

    const newProduct = new Product({
      id: newId,
      name,
      category,
      new_price,
      old_price,
      image: imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: "Product added successfully", product: newProduct });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


app.post("/removeproduct", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, message: "Product ID is required" });
  try {
    const deletedProduct = await Product.findOneAndDelete({ id });
    if (!deletedProduct) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: `Product with ID ${id} removed successfully` });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/allproducts", (req, res) => res.redirect("/api/allproducts"));
app.get("/products/:category", (req, res) => res.redirect(`/api/products/${req.params.category}`));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build', 'index.html')));
} else {
  app.get('/', (req, res) => res.send('Express API server is running in development mode. Access API at /api'));
}

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Invalid token format' });
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
    req.userId = decoded.userId;
    next();
  });
};

app.get('/api/cart', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('cart.productId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.post('/api/cart/add', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;
  if (!productId || typeof quantity !== 'number') return res.status(400).json({ success: false, message: 'Invalid productId or quantity' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!Array.isArray(user.cart)) user.cart = [];
    const index = user.cart.findIndex(item => item.productId.toString() === productId);
    if (index > -1) {
      user.cart[index].quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }
    await user.save();
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
  }
});

app.post('/api/cart/remove', verifyToken, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.userId;
  if (!productId) return res.status(400).json({ success: false, message: 'ProductId is required' });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!Array.isArray(user.cart)) user.cart = [];
    const index = user.cart.findIndex(item => item.productId.toString() === productId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found in cart' });
    if (user.cart[index].quantity <= quantity) {
      user.cart.splice(index, 1);
    } else {
      user.cart[index].quantity -= quantity;
    }
    await user.save();
  
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

const Order = mongoose.model('Order', OrderSchema);

// Assuming you have a Mongoose model called Order

  app.post('/api/order', verifyToken, async (req, res) => {
  try {
    const { name, number, products, address, totalAmount, paymentMode } = req.body;

    if (!name || !number || !products || !address || !totalAmount || !paymentMode) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newOrder = new Order({
      userId: req.userId,
      name,
      number,
      products,
      address,
      totalAmount,
      paymentMode
    });

    await newOrder.save();

    res.status(201).json({ success: true, message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error saving order:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/api/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
