import mongoose from 'mongoose';

let isConnected = false;

export const connectDb = async (retries = 5) => {
  if (isConnected) return;
  try {
    if (!process.env.DB_URL) {
      console.error('Database url not found.');
      return;
    }

    mongoose.set('strictQuery', true);

    mongoose.connect(process.env.DB_URL, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    mongoose.connection.on('connected', async () => {
      isConnected = true;
      console.log('Mongoose connected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error: ', err);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);

    if (retries > 0) {
      console.log(`Retrying MongoDB connection... (${retries})`);
      setTimeout(() => connectDb(retries - 1), 5000);
    }
  }
};
