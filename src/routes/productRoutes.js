const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product'); 
const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage });


router.post('/', upload.single('image'), (req, res) => {
  const { name, description, price, category, stock, size } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;  

  
  const newProduct = new Product({
    name,
    description,
    price,
    category,
    stock,
    size,
    image 
  });

  
  newProduct.save()
    .then(product => {
      res.status(201).json(product); 
    })
    .catch(err => {
      res.status(500).json({ message: 'Error creating product', error: err });
    });
});


router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); 
    res.json(products);  
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err });
  }
});


router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const { name, description, price, category, stock, size } = req.body;
      let updateFields = { name, description, price, category, stock, size };
  
      
      if (req.file) {
        updateFields.image = `/uploads/${req.file.filename}`;
      }
  
    
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateFields, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ message: 'Error updating product', error: err });
    }
  });
  

module.exports = router;

