import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { CONFIG } from "../../config/config.js";

cloudinary.config({
  cloud_name: CONFIG.cloudinaryName,
  api_key: CONFIG.cloudinaryApiKey,
  api_secret: CONFIG.cloudinaryApiSecret,
});

const uploadConfigs = {
  productImage: {
    folder: "Products",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  },
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const conf = uploadConfigs[file.fieldname];
    if (!conf) throw new Error(`Invalid field ${file.fieldname}`);
    const folder =
      typeof conf.folder === "function" ? conf.folder(req) : conf.folder;
    return {
      folder: `SyncStock/${folder}`,
      resource_type: "image",
      public_id: `${Date.now()}`,
    };
  },
});

const fileFilter = (req, file, cb) => {
  const conf = uploadConfigs[file.fieldname];
  if (!conf) return cb(new Error(`Invalid field ${file.fieldname}`), false);

  if (!conf.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for ${file.fieldname}`), false);
  }

  cb(null, true);
};

export const getPublicIdFromUrl = (url) => {
  try {
    const parts = url.split("/upload/")[1];
    if (!parts) return null;
    return parts.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

export const destroyFile = async (url) => {
  try {
    await cloudinary.uploader.destroy(getPublicIdFromUrl(url));
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};

export const upload = multer({ storage, fileFilter });
