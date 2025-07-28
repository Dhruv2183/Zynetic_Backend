
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// require('dotenv').config();

// const authRoutes = require('./routes/authRoutes');
// const productRoutes = require('./routes/productRoutes');

// const app = express();
// const PORT = process.env.PORT || 5002;


// app.use(express.json());
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));


// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);


// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("MongoDB connected successfully");
//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   })
//   .catch(err => {
//     console.error("Database connection error:", err.message);
//   });


// app.get('/', (req, res) => {
//   res.send('Server is running...');
// });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:3000',
  ],
  credentials: true, 
}));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// Database connection with serverless optimization
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10 // Connection pool size
      });
      console.log("MongoDB connected successfully");
    }
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
};

// Connect to DB and start server only in development
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// Export the Express app for Vercel
module.exports = app;