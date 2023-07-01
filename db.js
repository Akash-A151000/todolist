const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = "mongodb+srv://"+process.env.NAME+":"+process.env.PASSWORD+"@cluster0.zjypaj2.mongodb.net/todolistDB"
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
