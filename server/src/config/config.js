import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  port: process.env.PORT || 8089,
  dbUrl: process.env.DB_URL,
  nodeEnv: process.env.NODE_ENV,
  jwtSecretKey: process.env.JWT_SECRET,
  jwtExp: process.env.JWT_EXPIRES_IN,
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
