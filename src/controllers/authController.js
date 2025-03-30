const register = async (req, res) => {
    const { name, email, password, role } = req.body; 
  
    try {
      const userExists = await User.findOne({ email });
      if (userExists) return res.status(400).json({ message: "User already exists" });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
     
      const userRole = role && role === "admin" ? "admin" : "user";
  
      const user = await User.create({ name, email, password: hashedPassword, role: userRole });
  
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, 
        token: generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
  