import jwt from "jsonwebtoken";
import { CONFIG } from "../../config/config.js";

export const generateToken = async (user, expTime) => {
  const payload = {
    userId: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, CONFIG.jwtSecretKey, {
    expiresIn: expTime || CONFIG.jwtExp,
  });

  const tokenExp = await getDecodeData(token);

  return { token, tokenExp: tokenExp.exp };
};
export const getDecodeData = async (token) => {
  return jwt.decode(token);
};
