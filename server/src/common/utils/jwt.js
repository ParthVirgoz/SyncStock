import jwt from 'jsonwebtoken';

export const generateToken = async (user, expTime) => {
  const payload = {
    userId: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expTime || process.env.JWT_EXP,
  });

  const tokenExp = await getDecodeData(token);

  return { token, tokenExp: tokenExp.exp };
};
export const getDecodeData = async (token) => {
  return jwt.decode(token);
};
