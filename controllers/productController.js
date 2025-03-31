const createProduct = async (req, res) => {
    const { name, description, price, category, stock } = req.body;
  
    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const product = new Product({ name, description, price, category, stock });
      const createdProduct = await product.save();
      res.status(201).json(createdProduct);
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  