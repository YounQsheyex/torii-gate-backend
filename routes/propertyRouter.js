const router = require("express").Router();
const {
  createProperty,
  getLandlordsProperties,
  updatePropertyAvailability,
  getAllProperties,
  getAProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { isLoggedIn, requirePermissions } = require("../middleware/auth");

router.post("/", isLoggedIn, requirePermissions("landlord"), createProperty);
router.get(
  "/landlord",
  isLoggedIn,
  requirePermissions("landlord"),
  getLandlordsProperties
);
router.patch(
  "/landlord/:propertyId",
  isLoggedIn,
  requirePermissions("landlord"),
  updatePropertyAvailability
);
router.delete(
  "/landlord/:propertyId",
  isLoggedIn,
  requirePermissions("landlord"),
  deleteProperty
);
router.get("/", isLoggedIn, getAllProperties);
router.get("/:propertyId", isLoggedIn, getAProperty);

module.exports = router;
