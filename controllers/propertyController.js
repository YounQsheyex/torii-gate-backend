const PROPERTY = require("../models/property");

const createProperty = async (req, res) => {
  res.send("create property");
};
const getLandlordsProperties = async (req, res) => {
  const { userId } = req.user;
  const { page = 1 } = req.query;
  const limit = 5; // default limit
  const skip = (page - 1) * limit;
  try {
    const properties = await PROPERTY.find({ landlord: userId })
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);
    const totalProperties = await PROPERTY.countDocuments({ landlord: userId });
    const totalPages = Math.ceil(total / limit);
    const availableProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "available",
    });
    const rentedProperties = await PROPERTY.countDocuments({
      landlord: userId,
      availability: "rented",
    });
    res.status(200).json({
      total,
      availableProperties,
      rentedProperties,
      currentPage: parseInt(page),
      totalPages,
      properties,
      totalProperties,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
const updatePropertyAvailability = async (req, res) => {
  const { propertyId } = req.params;
  const { availability } = req.body;
  if (!availability) {
    return res.status(400).json({ message: "Provide Availability" });
  }
  try {
    const property = await PROPERTY.findById(propertyId);
    property.availability = availability;
    await property.save();
    res.status(200).json({
      success: true,
      message: "Status updated Successfully",
      property,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAllProperties = async (req, res) => {
  const { page = 1, location, budget, type } = req.query;
  const limit = 12;
  const skip = (page - 1) * limit;

  try {
    const filter = {
      availability: "available",
    };
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (budget) {
      filter.price = { $lte: parseInt(budget) };
    }
    if (type) {
      filter.title = { $regex: type, $options: "i" };
    }

    const properties = await PROPERTY.find(filter)
      .sort("-createdAt")
      .skip(skip)
      .limit(limit);

    const totalProperties = await PROPERTY.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    res.status(200).json({
      num: properties.length,
      totalPages,
      currentPage: parseInt(page),
      properties,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getAProperty = async (req, res) => {
  const { propertyId } = req.params;
  try {
    const property = await PROPERTY.findById(propertyId).populate(
      "landlord",
      "fullName profilePicture email phoneNumber"
    );
    // more from the landlord
    const moreFromLandlord = await PROPERTY.find({
      landlord: property.landlord._id,
      _id: { $ne: propertyId },
      availability: "available",
    })
      .limit(3)
      .sort("-createdAt");

    // similar properties range 20%
    const priceRange = property.price * 0.2;
    const similarProperties = await PROPERTY.find({
      _id: { $ne: propertyId },
      availability: "available",
      price: {
        $gte: property.price - priceRange,
        $lte: property.price + priceRange,
      },
      location: property.location,
    })
      .limit(3)
      .sort("-createdAt");
    res.status(200).json({ property, moreFromLandlord, similarProperties });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
};
