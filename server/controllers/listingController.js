const resTemplate = require("../static/ResponseTemplate");
const RoleType = require("../static/RoleType");
const UserService = require("../services/UserService");
const ListingService = require("../services/ListingService");
const HistoryService = require("../services/HistoryService");
const ApplicationService = require("../services/ApplicationService");

class ListingController {
  findListings(req, res, next) {
    if (
      !req.query.lat ||
      !req.query.lng ||
      !req.query.radius ||
      !req.query.type
    ) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    let latitude = parseFloat(req.query.lat);
    let longitude = parseFloat(req.query.lng);
    let radius = parseFloat(req.query.radius);
    let type = parseInt(req.query.type);

    let condition = {
      latitude: latitude,
      longitude: longitude,
      radius: radius,
    };
    if (req.query.minPrice) {
      condition.minPrice = req.query.minPrice;
    }
    if (req.query.maxPrice) {
      condition.maxPrice = req.query.maxPrice;
    }
    if (req.query.bedrooms) {
      condition.bedrooms = req.query.bedrooms;
    }
    if (req.query.bathrooms) {
      condition.bathrooms = req.query.bathrooms;
    }

    ListingService.findListings(condition, type).then((listings) => {
      if (listings) {
        for (var i = 0; i < listings.length; i++) {
          let listing = listings[i];
          if (!listing.image_links) {
            listing.image_links = "";
          } else {
            listing.image_links = listing.image_links[0];
          }
        }
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: listings }));
      } else {
        res.status(404).json(resTemplate.NO_DATA);
      }
    });
  }

  getListingById(req, res, next) {
    let listingId = req.params.id;
    let user = req.body.user;
    if (listingId) {
      ListingService.getListingById(listingId).then(async (listing) => {
        if (listing) {
          let images = listing.image_links;
          if (!images) {
            listing.image_links = ["", "", "", "", ""];
          } else if (images.length < 5) {
            for (var size = images.length; size < 5; size++) {
              images.push("");
            }
            listing.image_links = images;
          }

          if (user) {
            await ListingService.isFavoriteListing(user.id, listing.id).then(
              (isFavorite) => {
                if (isFavorite) {
                  listing.isFavorite = true;
                } else {
                  listing.isFavorite = false;
                }
                res.json(Object.assign({}, resTemplate.SUCCESS, { data: listing }));
                return;
              }
            );
            HistoryService.viewListing(user.id, listingId);
          } else {
            listing.isFavorite = false;
            res.json(Object.assign({}, resTemplate.SUCCESS, { data: listing }));
            return;
          }
        } else {
          res.status(404).json(resTemplate.NO_DATA);
        }
      });
    }
  }

  createListing(req, res, next) {
    let property = req.body.property;
    if (property) {
      ListingService.createListing(req.body.user.id, property).then(
        (result) => {
          if (result) {
            res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        }
      );
    } else {
      res.status(400).json(resTemplate.MISS_FIELD);
    }
  }

  getListingsByOwnerId(req, res) {
    let owner = req.body.user;
    if (!owner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    ListingService.getListingsByOwnerId(owner.id).then((listings) => {
      if (listings == undefined) {
        res.status(500).json(resTemplate.DATABASE_ERROR);
        return;
      }
      res.json(Object.assign({}, resTemplate.SUCCESS, { data: listings }));
    });
  }

  copyFromListing(req, res, next) {
    let user = req.body.user;
    let listingId = req.params.id;
    if (listingId) {
      ListingService.duplicateListing(user.id, listingId).then((result) => {
        if (result) {
          res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
        } else if (result == false) {
          res.status(404).json(resTemplate.NO_DATA);
        } else {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        }
      });
    } else {
      res.status(400).json(resTemplate.MISS_FIELD);
    }
  }

  updateListingProperty(req, res, next) {
    let userId = req.body.user.id;
    let properties = req.body.property;
    let listingId = req.body.id;
    if (!listingId || !properties) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    ListingService.verifyListingOwner(userId, listingId).then((isOwner) => {
      if (!isOwner) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      ListingService.updateListingProperty(listingId, properties).then(
        (result) => {
          if (result) {
            res.json(resTemplate.SUCCESS);
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        }
      );
    });
  }

  updateListingStatus(req, res, next) {
    let user = req.body.user;
    let listingId = req.body.id;
    let statusId = req.body.status;

    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }

    if (!listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    if (!statusId || statusId > 4 || statusId < 0) {
      res.status(400).json(resTemplate.INVALID_INPUT);
      return;
    }

    ListingService.updateListingStatus(listingId, statusId).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }

  getListingApplications(req, res) {
    let user = req.body.user;
    let listingId = req.params.id;

    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    if (!listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    ListingService.verifyListingOwner(user.id, listingId).then((isOwner) => {
      if (!isOwner) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      ApplicationService.getApplicationsByListingId(listingId).then(
        (applications) => {
          res.json(Object.assign({}, resTemplate.SUCCESS, { data: applications }));
        }
      );
    });
  }

  deleteListing(req, res, next) {
    let userId = req.body.user.id;
    let listingId = req.params.id;
    if (!listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    ListingService.verifyListingOwner(userId, listingId).then((isOwner) => {
      if (!isOwner) {
        res.status(401).json(resTemplate.PERMISSION_DENY);
        return;
      }
      ListingService.deleteListing(listingId).then((result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else {
          res.status(500).json(resTemplate.FAIL);
        }
      });
    });
  }

  verifyHostRole(req, res, next) {
    let user = req.body.user;
    let userId = user.id;
    if (!user) {
      res.status(403);
    }
    UserService.checkUserRole(userId, RoleType.HOST.id).then((result) => {
      if (result) {
        next();
      } else {
        res.status(403).json(resTemplate.PERMISSION_DENY);
      }
    });
  }
}

module.exports = new ListingController();
