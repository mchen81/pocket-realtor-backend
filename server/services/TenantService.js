const resTemplate = require("../static/ResponseTemplate");
const {
  TenantZipPreference,
  User,
  UserRole,
  FavoriteListing,
  Listing,
} = require("../models/models");
const { Op, Sequelize } = require("sequelize");
const RoleType = require("../static/RoleType");
const zipCodeUtil = require("../utils/ZipCodeUtil");

class TenantService {
  updateZipPreference(userId, zips) {
    for (var i = 0; i < zips.length; i++) {
      let zip = zips[i];
      if (!zipCodeUtil.isZipCodeValid(zip)) {
        return false;
      }
    }
    return TenantZipPreference.destroy({ where: { user_id: userId } })
      .then(() => {
        var data = [];
        for (var i = 0; i < zips.length; i++) {
          let zip = zips[i];
          let row = { user_id: userId, zip_code: zip };
          data.push(row);
        }
        return TenantZipPreference.bulkCreate(data).then(() => {
          return true;
        });
      })
      .catch((err) => {
        return undefined;
      });
  }

  addZipPreference(userId, zip) {
    if (!zipCodeUtil.isZipCodeValid(zip)) {
      return false;
    }
    return TenantZipPreference.findOne({
      where: { user_id: userId, zip_code: zip },
    }).then((row) => {
      if (row) {
        return true;
      } else {
        return TenantZipPreference.create({
          user_id: userId,
          zip_code: zip,
        }).then(() => {
          return true;
        });
      }
    });
  }

  updateCityPreference(userId, cities) {
    var preferredZips = [];
    for (var i = 0; i < cities.length; i++) {
      let city = cities[i];
      if (zipCodeUtil.isCityStateValid(city.city, city.state)) {
        let zipcodes = Array.from(
          zipCodeUtil.getZipCodesByCityState(city.city, city.state)
        );
        preferredZips = preferredZips.concat(zipcodes);
      }
    }
    return this.updateZipPreference(userId, preferredZips);
  }

  addCityPreference(userId, city, state) {
    if (zipCodeUtil.isCityStateValid(city, state)) {
      return this.updateZipPreference(
        userId,
        zipCodeUtil.getZipCodesByCityState(city, state)
      );
    } else {
      return undefined;
    }
  }

  getTenantPreference(userId) {
    return TenantZipPreference.findAll({
      attributes: ["zip_code"],
      where: { user_id: userId },
      row: true,
    })
      .then((preferredZips) => {
        let citySet = new Set();
        let zips = [];
        for (var i = 0; i < preferredZips.length; i++) {
          let zip = preferredZips[i].get("zip_code");
          zips.push(zip);
          let city = zipCodeUtil.getCityStateByZipCode(zip);
          citySet.add(city.city + ", " + city.state);
        }
        zips.sort((a, b) => a - b);
        let sortedCity = Array.from(citySet).sort();
        return {
          userId: userId,
          preferredZips: zips,
          preferredCities: sortedCity,
        };
      })
      .catch((err) => {
        return undefined;
      });
  }

  findTenants(preferredZips) {
    return User.findAll(/* add filters here */).then((users) => {
      let userMap = new Map();
      let fitUserIds = [];
      for (var i = 0; i < users.length; i++) {
        let user = users[i];
        let userId = user.get("id");
        userMap.set(userId, user);
        fitUserIds.push(userId);
      }
      return TenantZipPreference.findAll({
        attributes: ["user_id"],
        where: {
          user_id: {
            [Op.in]: fitUserIds,
          },
          zip_code: {
            [Op.in]: preferredZips,
          },
        },
        group: ["user_id"],
      }).then((fitUsers) => {
        let result = [];
        for (var i = 0; i < fitUsers.length; i++) {
          let fittingUser = userMap.get(fitUsers[i].get("user_id"));
          let resUser = {
            id: fittingUser.get("id"),
            firstname: fittingUser.get("first_name"),
            lastname: fittingUser.get("last_name"),
            email: fittingUser.get("email"),
            gender: fittingUser.get("gender"),
            occupation: fittingUser.get("occupation"),
            avatar: fittingUser.get("avatar"),
          };
          result.push(resUser);
        }
        return result;
      });
    });
  }

  findAllTenants() {
    return UserRole.findAll({
      attributes: ["user_id"],
      where: { role_id: RoleType.RENTER.id },
    })
      .then((ids) => {
        var userIds = [];
        for (var i = 0; i < ids.length; i++) {
          userIds.push(ids[i].get("user_id"));
        }
        return User.findAll({
          where: {
            id: { [Op.in]: userIds },
          },
        }).then((users) => {
          var result = [];
          for (var i = 0; i < users.length; i++) {
            let user = users[i];
            let resUser = {
              id: user.get("id"),
              firstname: user.get("first_name"),
              lastname: user.get("last_name"),
              email: user.get("email"),
              gender: user.get("gender"),
              occupation: user.get("occupation"),
              avatar: user.get("avatar"),
            };
            result.push(resUser);
          }
          return result;
        });
      })
      .catch((err) => {
        return undefined;
      });
  }

  async addToFavorite(userId, listingId) {
    return await FavoriteListing.findOne({
      where: {
        user_id: userId,
        listing_id: listingId,
      },
    }).then((row) => {
      if (row) {
        return true;
      }
      return FavoriteListing.create({
        user_id: userId,
        listing_id: listingId,
        create_time: Sequelize.fn("NOW"),
      })
        .then(() => {
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    });
  }

  deleteFavorite(userId, listingId) {
    return FavoriteListing.findOne({
      where: {
        user_id: userId,
        listing_id: listingId,
      },
    })
      .then((row) => {
        if (!row) {
          return true;
        }
        return row
          .destroy()
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  getUserFavoriteListings(userId) {
    return FavoriteListing.findAll({
      attributes: [
        ["listing_id", "id"],
        [Sequelize.col("listing.title"), "title"],
        [Sequelize.col("listing.sale_price"), "salePrice"],
        [Sequelize.col("listing.rent_price"), "rentPrice"],
        [Sequelize.col("listing.address"), "address"],
        [Sequelize.col("listing.city"), "city"],
        [Sequelize.col("listing.state"), "state"],
        [Sequelize.col("listing.zip_code"), "zipcode"],
        [Sequelize.col("create_time"), "addAt"],
      ],
      raw: true,
      where: { user_id: userId },
      order: [["create_time", "DESC"]],
      include: {
        model: Listing,
        attributes: [],
      },
    })
      .then((result) => {
        return result;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  test(userId) {
    return FavoriteListing.findAll({
      attributes: [
        ["listing_id", "id"],
        [Sequelize.col("listing.title"), "title"],
        [Sequelize.col("create_time"), "addAt"],
      ],
      raw: true,
      where: { user_id: userId },
      order: [["create_time", "DESC"]],
      include: {
        model: Listing,
        attributes: [],
      },
    }).then((result) => {
      return result;
    });
  }
}

module.exports = new TenantService();
