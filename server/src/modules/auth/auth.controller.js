import authService from "./auth.service.js";
import httpStatus from "http-status";
import {
  errorResponse,
  successResponse,
} from "../../common/utils/apiResponse.js";
import { MESSAGES } from "../../common/constants/messages.js";
import { generateToken } from "../../common/utils/jwt.js";

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await authService.findByEmail(email);

    if (!admin) {
      return errorResponse(
        req,
        res,
        httpStatus.UNAUTHORIZED,
        MESSAGES.ERROR.WRONG_CREDENTIALS,
      );
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return errorResponse(
        req,
        res,
        httpStatus.UNAUTHORIZED,
        MESSAGES.ERROR.WRONG_PASSWORD,
      );
    }

    const token = await generateToken({
      id: admin._id,
      email: admin.email,
    });

    const { password: _pw, ...safeAdmin } = admin.toObject();

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.LOGIN_SUCCESS,
      {
        user: safeAdmin,
        token,
      },
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      req,
      res,
      httpStatus.INTERNAL_SERVER_ERROR,
      error.message,
    );
  }
};

export default {
  login,
};
