import Location from './location.model.js';

const addLocation = async (data) => {
  try {
    return await Location.create(data);
  } catch (error) {
    throw new Error(`Error in addLocation: ${error.message}`);
  }
};
const listLocations = async (isActive) => {
  try {
    let filter = {};

    if (isActive === 'true') {
      filter.isActive = true;
    }

    return await Location.find(filter);
  } catch (error) {
    throw new Error(`Error in listLocations: ${error.message}`);
  }
};

const updateLocation = async (id, data) => {
  try {
    return await Location.findByIdAndUpdate(id, data, { returnDocument: true });
  } catch (error) {
    throw new Error(`Error in updateLocation: ${error.message}`);
  }
};

const getLocationById = async (id) => {
  try {
    return await Location.findOne({ _id: id, isActive: true });
  } catch (error) {
    throw new Error(`Error in getLocationById: ${error.message}`);
  }
};

export default {
  addLocation,
  listLocations,
  updateLocation,
  getLocationById,
};
