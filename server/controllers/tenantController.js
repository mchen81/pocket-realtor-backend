const resTemplate = require("../static/ResponseTemplate");
const RoleType = require("../static/RoleType");
const TenantService = require("../services/TenantService");
const UserService = require("../services/UserService");
const zipCodeUtil = require("../utils/ZipCodeUtil");

class TenantController {
  addTenantZipPreference(req, res) {
    // put a zip code
    let user = req.body.user;
    let zip = req.params.zip;
    if (!zip || !zipCodeUtil.isZipCodeValid(zip.toString())) {
      res.status(400).json(resTemplate.INVALID_ZIP_CODE);
      return
    }
    TenantService.addZipPreference(user.id, zip.toString()).then((success) => {
      if (success) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(404).json(resTemplate.FAIL);
      }
    });
  }

  updateTenantPreference(req, res) {
    let user = req.body.user;
    let zipcodes = req.body.zipcodes; // zipcodes : [94117, 94118, ...]
    let cities = req.body.cities; // [{city: San Jose, state: CA}, {city: San Franciscoe, state: CA} ... ]

    if (zipcodes == undefined && cities == undefined) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    } else if (zipcodes != undefined) {
      if (!Array.isArray(zipcodes)) {
        res.status(404).json(resTemplate.INVALID_ZIP_CODE);
        return;
      }
      TenantService.updateZipPreference(user.id, zipcodes).then((result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else {
          res.status(404).json(resTemplate.FAIL);
        }
      });
    } else if (cities != undefined) {
      if (!Array.isArray(cities)) {
        res.status(404).json(resTemplate.INVALID_INPUT);
        return;
      }
      TenantService.updateCityPreference(user.id, cities).then((result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else {
          res.status(404).json(resTemplate.FAIL);
        }
      });
    }
  }

  addCityPreference(req, res) {
    let user = req.body.user;
    let city = req.body.city;
    let state = req.body.state;
    if (city && state) {
      TenantService.addCityPreference(user.id, city, state).then((result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else if (result == undefined) {
          res.status(404).json(resTemplate.NO_DATA);
        } else {
          res.status(404).json(resTemplate.FAIL);
        }
      });
    }
  }

  getTenantPreference(req, res) {
    let userId = req.params.userId;
    TenantService.getTenantPreference(userId).then((result) => {
      if (result == undefined) {
        res.status(404).json(resTemplate.NO_DATA);
        return;
      }
      res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
    });
  }

  searchTenants(req, res) {
    let city = req.query.city;
    let state = req.query.state;
    // let query = req.query.zipcodes;

    if (city && state) {
      let zipcodes =  zipCodeUtil.getZipCodesByCityState(city, state)
      TenantService.findTenants(zipcodes).then((result) => {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      });
    } else {
      TenantService.findAllTenants().then((result) => {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      });
    }
  }

  addListingToFavorite(req, res) {
    let user = req.body.user;
    let listingId = req.params.listingId;

    if (!user || !listingId) {
      res.status(404).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantService.addToFavorite(user.id, listingId).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).send(resTemplate.DATABASE_ERROR);
      }
    });
  }

  deleteOneFavoriteListing(req, res) {
    let user = req.body.user;
    let listingId = req.params.listingId;

    if (!user || !listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantService.deleteFavorite(user.id, listingId).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).send("Fail to delete the favorite");
      }
    });
  }

  getFavoriteListings(req, res) {
    console.log(req.body.user);
    if (req.params.userId != undefined) {
      var userId = req.params.userId;
    } else if (req.body.user) {
      var userId = req.body.user.id;
    } else {
      res.status(403).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantService.getUserFavoriteListings(userId).then((favorites) => {
      if (favorites) {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: favorites }));
      } else {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: [] }));
      }
    });
  }

  verifyTenantRole(req, res, next) {
    let user = req.body.user;
    let userId = user.id;
    if (!user) {
      res.status(403);
    }
    UserService.checkUserRole(userId, RoleType.RENTER.id).then((result) => {
      if (result) {
        next();
      } else {
        res.status(403).json(resTemplate.PERMISSION_DENY);
      }
    });
  }
}

module.exports = new TenantController();
