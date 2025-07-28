
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

// ✅ Correct CORS Configuration


// ✅ Apply CORS Middleware Globally
app.use(cors());

// ✅ Ensure Express parses JSON before routing
app.use(express.json());

// ✅ Preflight OPTIONS request for all routes
app.options('*', cors(corsOptions));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);


// Health Check
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// MongoDB Connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
      });
      console.log('MongoDB connected successfully');
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
};

// ✅ Start Server (Dev only)
if (process.env.NODE_ENV !== 'production') {
  connectDB().then(() => {
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  });
}

// ✅ Export Express app for Vercel
module.exports = app;
