var express = require("express");
var router = express.Router();
const Tenant = require("../controllers/tenantController");
const User = require("../controllers/userController");
const TenantGroup = require("../controllers/groupController");
// router.get('/user/:userId/', User.getUserProfile)
router.put(
  "/tenant/preference/:zip",
  User.verifyToken,
  Tenant.verifyTenantRole,
  Tenant.addTenantZipPreference
);

router.put(
  "/tenant/preference/",
  User.verifyToken,
  Tenant.verifyTenantRole,
  Tenant.addCityPreference
);

router.post(
  "/tenant/preference/update",
  User.verifyToken,
  Tenant.verifyTenantRole,
  Tenant.updateTenantPreference
);

router.get("/tenant/preference/:userId", Tenant.getTenantPreference);

router.get("/tenants", Tenant.searchTenants);

router.put(
  "/tenant/favorite/:listingId",
  User.verifyToken,
  Tenant.addListingToFavorite
);
router.delete(
  "/tenant/favorite/:listingId",
  User.verifyToken,
  Tenant.deleteOneFavoriteListing
);

router.get(
  "/tenant/favorite/",
  User.interpretToken,
  Tenant.getFavoriteListings
);

router.get(
  "/tenant/favorite/:userId",
  Tenant.getFavoriteListings
);

module.exports = router;
