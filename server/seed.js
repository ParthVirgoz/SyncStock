import "dotenv/config";
import mongoose from "mongoose";
import Auth from "./src/modules/auth/auth.model.js";
import bcrypt from "bcrypt";
import { CONFIG } from "./src/config/config.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(CONFIG.dbUrl);
    console.log("✅ MongoDB connected");

    const existingAdmin = await Auth.findOne({ email: "admin@syncstock.com" });

    if (existingAdmin) {
      console.log("⚠️  Admin already exists with this email. Skipping seed.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const admin = new Auth({
      email: "admin@syncstock.com",
      password: hashedPassword,
    });

    await admin.save();

    console.log("✅ Admin created successfully:");
    console.log({
      email: admin.email,
      id: admin._id,
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
