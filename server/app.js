import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import path from 'path';
import { connectDb } from './src/database/db.js';

import authRoutes from './src/modules/auth/auth.routes.js';
import categoryRoutes from './src/modules/category/category.routes.js';
import productRoutes from './src/modules/product/product.routes.js';
import locationRoutes from './src/modules/location/location.routes.js';
import inventoryRoutes from './src/modules/inventory/inventory.routes.js';
import bomRoutes from './src/modules/bom/bom.routes.js';
import productionRoutes from './src/modules/production/production.routes.js';
import supplierRoutes from './src/modules/supplier/supplier.routes.js';
import purchaseOrderRoutes from './src/modules/purchaseOrder/purchaseOrder.routes.js';
import saleOrderRoutes from './src/modules/saleOrder/saleOrder.routes.js';
import productTypeRoutes from './src/modules/productType/productType.routes.js';
import { CONFIG } from './src/config/config.js';

connectDb();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Security
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);

app.get('/health', (req, res) => {
  res.send({
    status: 'active',
    uptime: process.uptime(),
  });
});

//Routes
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/locations', locationRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/bom', bomRoutes);
app.use('/production-orders', productionRoutes);
app.use('/purchase-orders', purchaseOrderRoutes);
app.use('/suppliers', supplierRoutes);
app.use('/sale-orders', saleOrderRoutes);
app.use('/productTypes', productTypeRoutes);

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err.message);
});

app.listen(CONFIG.port, (req, res) => {
  console.log(`Server running on port ${CONFIG.port}`);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err.message);
  process.exit(1);
});
