const mongoose = require('mongoose');

// Select the database based on the environment
const localDB = process.env.URL_DB_LOCAL;
const liveDB = process.env.URL_DB_LIVE;
const dbURL = process.env.NODE_ENV === 'production' ? liveDB : localDB;
const dbConnect = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.Promise = global.Promise;
    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.once('open', () => {
      console.log(`Connected to MongoDB (${process.env.NODE_ENV === 'production' ? 'live' : 'local'})`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

module.exports = dbConnect;
