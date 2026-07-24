import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
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

function uploadBuffer(buffer, fieldname) {
  const conf = uploadConfigs[fieldname];
  if (!conf) {
    throw new Error(`Invalid field ${fieldname}`);
  }

  const folder =
    typeof conf.folder === "function" ? conf.folder() : conf.folder;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `SyncStock/${folder}`,
        resource_type: "image",
        public_id: `${Date.now()}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
}

const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    const chunks = [];

    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", (error) => cb(error));

    file.stream.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = await uploadBuffer(buffer, file.fieldname);

        cb(null, {
          size: buffer.length,
          path: result.secure_url,
          location: result.secure_url,
        });
      } catch (error) {
        cb(error);
      }
    });
  },

  _removeFile(req, file, cb) {
    if (file.path) {
      destroyFile(file.path).finally(() => cb(null));
      return;
    }

    cb(null);
  },
};

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
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return false;

    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
};

export const upload = multer({ storage: cloudinaryStorage, fileFilter });
