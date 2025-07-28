// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const Product = require('../models/Product'); 
// const router = express.Router();


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');  
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); 
//   }
// });

// const upload = multer({ storage });


// router.post('/', upload.single('image'), (req, res) => {
//   const { name, description, price, category, stock, size } = req.body;
//   const image = req.file ? `/uploads/${req.file.filename}` : null;  

  
//   const newProduct = new Product({
//     name,
//     description,
//     price,
//     category,
//     stock,
//     size,
//     image 
//   });

  
//   newProduct.save()
//     .then(product => {
//       res.status(201).json(product); 
//     })
//     .catch(err => {
//       res.status(500).json({ message: 'Error creating product', error: err });
//     });
// });


// router.get('/', async (req, res) => {
//   try {
//     const products = await Product.find(); 
//     res.json(products);  
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching products', error: err });
//   }
// });


// router.delete('/:id', async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting product', error: err });
//   }
// });


// router.put('/:id', upload.single('image'), async (req, res) => {
//     try {
//       const { name, description, price, category, stock, size } = req.body;
//       let updateFields = { name, description, price, category, stock, size };
  
      
//       if (req.file) {
//         updateFields.image = `/uploads/${req.file.filename}`;
//       }
  
    
//       const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
  
//       if (!updatedProduct) {
//         return res.status(404).json({ message: 'Product not found' });
//       }
  
//       res.json(updatedProduct);
//     } catch (err) {
//       res.status(500).json({ message: 'Error updating product', error: err });
//     }
//   });
  

// module.exports = router;



const express = require('express');
const Product = require('../models/Product');
const upload = require('../utils/cloudinaryUpload');
const router = express.Router();

// If using 'require' (CommonJS):
const cors = require('cors');

// --- CORS Middleware ---
const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};

// This should be at the start of every handler file:
router.use(cors(corsOptions));


// Create Product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const image = req.file ? req.file.path : null;

    const size = Array.isArray(req.body.size)
      ? req.body.size
      : req.body.size
      ? [req.body.size]
      : [];

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      stock,
      size,
      image,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: 'Error creating product', error: err.message || String(err) });
  }
});

// Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
});

// Delete Product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err });
  }
});

// Update Product
// Update Product
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Parse size as array safely
    let size = [];
    if (Array.isArray(req.body.size)) {
      size = req.body.size;
    } else if (typeof req.body.size === 'string') {
      size = [req.body.size];
    }

    // Build update object dynamically
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = parseFloat(price);
    if (category !== undefined) updateFields.category = category;
    if (stock !== undefined) updateFields.stock = parseInt(stock);
    if (size.length > 0) updateFields.size = size;
    if (req.file) updateFields.image = req.file.path;

    // Perform the update
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({
      message: 'Error updating product',
      error: err?.message || String(err),
    });
  }
});



module.exports = router;
