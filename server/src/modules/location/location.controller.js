import locationService from './location.service.js';
import httpStatus from 'http-status';
import {
  errorResponse,
  successResponse,
} from '../../common/utils/apiResponse.js';
import { MESSAGES } from '../../common/constants/messages.js';

const addNewLocation = async (req, res) => {
  try {
    const location = await locationService.addLocation(req.body);

    if (!location) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.LOCATION_ADD_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.CREATED,
      MESSAGES.SUCCESS.LOCATION_ADDED,
      location,
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

const listAllLocations = async (req, res) => {
  try {
    const { isActive } = req.query;

    const locations = await locationService.listLocations(isActive);

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.LOCATION_LIST,
      locations,
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

const updateLocation = async (req, res) => {
  try {
    const location = await locationService.getLocationById(req.params.id);
    if (!location) {
      return errorResponse(
        req,
        res,
        httpStatus.NOT_FOUND,
        MESSAGES.ERROR.LOCATION_NOT_FOUND,
      );
    }

    const updatedLocation = await locationService.updateLocation(
      req.params.id,
      req.body,
    );

    if (!updatedLocation) {
      return errorResponse(
        req,
        res,
        httpStatus.CONFLICT,
        MESSAGES.ERROR.LOCATION_UPDATE_FAILED,
      );
    }

    return successResponse(
      req,
      res,
      httpStatus.OK,
      MESSAGES.SUCCESS.LOCATION_UPDATED,
      updatedLocation,
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
  addNewLocation,
  listAllLocations,
  updateLocation,
};
