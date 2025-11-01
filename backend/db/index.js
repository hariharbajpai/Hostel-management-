import mongoose from 'mongoose';

export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const localUri = 'mongodb://localhost:27017/hostel-management';
  
  if (!uri) {
    console.warn('MONGODB_URI missing in .env, using local MongoDB');
    try {
      await mongoose.connect(localUri, { autoIndex: true });
      console.log('Connected to local MongoDB');
      return;
    } catch (error) {
      console.error('Failed to connect to local MongoDB:', error.message);
      throw new Error('No database connection available');
    }
  }

  try {
    await mongoose.connect(uri, { 
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.warn('Failed to connect to MongoDB Atlas:', error.message);
    console.log('Attempting to connect to local MongoDB...');
    
    try {
      await mongoose.connect(localUri, { autoIndex: true });
      console.log('Connected to local MongoDB as fallback');
    } catch (localError) {
      console.error('Failed to connect to local MongoDB:', localError.message);
      throw new Error('No database connection available - please ensure MongoDB is running locally or check your Atlas connection');
    }
  }
}
