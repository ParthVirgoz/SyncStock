import "dotenv/config";
import mongoose from "mongoose";
import Auth from "./src/modules/auth/auth.model.js";
import ProductType from "./src/modules/productType/productType.model.js";
import bcrypt from "bcrypt";
import { CONFIG } from "./src/config/config.js";

const DEFAULT_PRODUCT_TYPES = [
  {
    name: "RAW",
    description: "Raw materials used in production",
  },
  {
    name: "SEMI",
    description: "Semi-finished goods",
  },
  {
    name: "FINISHED",
    description: "Finished goods ready for sale",
  },
];

async function seedAdmin() {
  const existingAdmin = await Auth.findOne({ email: "admin@syncstock.com" });

  if (existingAdmin) {
    console.log("⚠️  Admin already exists. Skipping admin seed.");
    return existingAdmin;
  }

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await Auth.create({
    email: "admin@syncstock.com",
    password: hashedPassword,
  });

  console.log("✅ Admin created successfully:");
  console.log({
    email: admin.email,
    id: admin._id,
  });

  return admin;
}

async function seedProductTypes() {
  const created = [];

  for (const productType of DEFAULT_PRODUCT_TYPES) {
    const existing = await ProductType.findOne({
      name: productType.name,
    });

    if (existing) {
      console.log(`⚠️  Product type "${productType.name}" already exists. Skipping.`);
      continue;
    }

    const record = await ProductType.create(productType);
    created.push(record);
    console.log(`✅ Product type created: ${record.name} (${record._id})`);
  }

  if (!created.length) {
    console.log("⚠️  All default product types already exist.");
  }

  return created;
}

async function runSeed() {
  try {
    await mongoose.connect(CONFIG.dbUrl);
    console.log("✅ MongoDB connected");

    await seedAdmin();
    await seedProductTypes();

    process.exit(0);
  } catch (error) {
    console.error("❌ Error running seed:", error);
    process.exit(1);
  }
}

runSeed();
