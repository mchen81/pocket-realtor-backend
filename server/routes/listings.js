var express = require("express");
var router = express.Router();

const Listing = require("../controllers/listingController");
const User = require("../controllers/userController");

router.post(
  "/listing/create",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.createListing
);
router.get("/listings", Listing.findListings);

router.get("/listing/:id", User.interpretToken, Listing.getListingById);

router.put(
  "/listing/duplicate/:id",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.copyFromListing
);
router.put(
  "/listing/update",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.updateListingProperty
);
router.put(
  "/listing/update/status",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.updateListingStatus
);

router.get(
  "/listing/owner/listings",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.getListingsByOwnerId
);

router.delete(
  "/listing/delete/:id",
  User.verifyToken,
  Listing.verifyHostRole,
  Listing.deleteListing
);

router.get(
  "/listing/applications/:id",
  User.verifyToken,
  Listing.getListingApplications
);
module.exports = router;
