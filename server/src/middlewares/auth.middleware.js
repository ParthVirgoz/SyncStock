import status from "http-status";
import { errorResponse } from "../common/utils/apiResponse.js";
import { getDecodeData } from "../common/utils/jwt.js";
import Auth from "../modules/auth/auth.model.js";

const authorization = async (req, res, next) => {
  try {
    const authHeader =
      req.headers.authorization ||
      req.headers.authorization?.startsWith("Bearer ");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ") ||
      authHeader === "null"
    ) {
      return errorResponse(
        req,
        res,
        status.FORBIDDEN,
        "Authorization forbidden",
      );
    }

    const authToken = authHeader.split(" ")[1];

    if (!authToken || authToken === "null") {
      return errorResponse(
        req,
        res,
        status.UNAUTHORIZED,
        "Authentication token is missing or invalid.",
      );
    }

    const decode = await getDecodeData(authToken);

    const currentTime = Math.floor(Date.now() / 1000);

    if (decode?.exp < currentTime) {
      return errorResponse(req, res, status.UNAUTHORIZED, "Token Expired.");
    }

    const user = await Auth.findOne({ email: decode.email });

    if (!user) {
      return errorResponse(
        req,
        res,
        status.UNAUTHORIZED,
        "User is not found or Inactive.",
      );
    }

    req.user = user;
    req.role = user?.role;

    next();
  } catch (error) {
    console.error(error);
    return errorResponse(
      req,
      res,
      status.INTERNAL_SERVER_ERROR,
      `An unexpected error occurred. ${error.message}`,
    );
  }
};

export default authorization;
