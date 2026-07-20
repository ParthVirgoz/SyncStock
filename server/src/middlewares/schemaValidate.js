import { status } from 'http-status';
import { errorResponse } from '../common/utils/apiResponse.js';

export const validateSchema =
  (schema, type = 'body') =>
  (req, res, next) => {
    const hasFile = !!req.file;
    if (!hasFile && (!req[type] || Object.keys(req[type]).length === 0)) {
      return errorResponse(
        req,
        res,
        status.BAD_REQUEST,
        'Request body is required'
      );
    }

    const { error, value } = schema.validate(req[type], {
      abortEarly: true,
    });

    if (error) {
      return errorResponse(
        req,
        res,
        status.BAD_REQUEST,
        error.details[0].message
      );
    }

    req[type] = value;
    next();
  };
