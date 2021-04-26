const { Listing, FavoriteListing } = require("../models/models");
const { Op } = require("sequelize");
const ListingStatus = require("../../common/Constans/ListingStatus");
const HouseSearchType = require("../../common/Constans/HouseSearchType");
const UserService = require("./UserService");
const RoleType = require("../static/RoleType");

class ListingService {
  findListings(conditions, type) {
    let queryOptions = getFindListingQueryOptions(conditions, type);
    if (queryOptions == undefined) {
      return undefined;
    }

    return Listing.findAll({ raw: true, where: queryOptions }).then(
      (listings) => {
        return listings;
      }
    );
  }

  getListingById(listingId) {
    return Listing.findByPk(listingId, { raw: true }).then((listing) => {
      return UserService.getUserRoles(listing.owner_id).then((role) => {
        if (role.role_id == RoleType.AGENT.id) {
          listing.isAgent = true;
        } else {
          listing.isAgent = false;
        }
        return listing;
      });
    });
  }

  createListing(ownerId, property) {
    property.owner_id = ownerId;
    if (!property.status) {
      property.status = ListingStatus.AVAILABLE.id;
    }
    return Listing.create(property)
      .then((listing) => {
        return listing;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  duplicateListing(ownerId, listingId) {
    return Listing.findByPk(listingId)
      .then((listing) => {
        if (!listing) {
          return false;
        }
        let replicatedListing = {
          title: listing.get("title"),
          description: listing.get("description"),
          address: listing.get("address"),
          city: listing.get("city"),
          state: listing.get("state"),
          latitude: listing.get("latitude"),
          longitude: listing.get("longitude"),
          rooms: listing.get("rooms"),
          zip_code: listing.get("zip_code"),
          rent_price: listing.get("rent_price"),
          sale_price: listing.get("sale_price"),
          bath_rooms: listing.get("bath_rooms"),
          area: listing.get("area"),
          age: listing.get("age"),
          status: listing.status,
          owner_id: ownerId,
        };

        return Listing.create(replicatedListing).then((newListing) => {
          if (newListing) {
            return newListing;
          } else {
            return undefined;
          }
        });
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getListingsByOwnerId(ownerId) {
    return Listing.findAll({
      raw: true,
      where: {
        owner_id: ownerId,
      },
      order: [["created_at"]],
    })
      .then((listings) => {
        return listings;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  updateListingProperty(listingId, property) {
    return Listing.findByPk(listingId).then((listing) => {
      if (listing) {
        if (property.title) {
          listing.title = property.title;
        }
        if (property.description) {
          listing.description = property.description;
        }
        if (property.address) {
          listing.address = property.address;
        }
        if (property.city) {
          listing.city = property.city;
        }
        if (property.state) {
          listing.state = property.state;
        }
        if (property.latitude) {
          listing.latitude = property.latitude;
        }
        if (property.longitude) {
          listing.longitude = property.longitude;
        }
        if (property.rooms) {
          listing.rooms = property.rooms;
        }
        if (property.zip_code) {
          listing.zip_code = property.zip_code;
        }
        if (property.type) {
          listing.type = property.type;
        }
        if (property.rent_price) {
          listing.rent_price = property.rent_price;
        }
        if (property.sale_price) {
          listing.sale_price = property.sale_price;
        }
        if (property.bath_rooms) {
          listing.bath_rooms = property.bath_rooms;
        }
        if (property.area) {
          listing.area = property.area;
        }
        if (property.age) {
          listing.age = property.age;
        }
        return listing
          .save()
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return undefined;
          });
      } else {
        return false;
      }
    });
  }

  updateListingStatus(listingId, statusId) {
    return Listing.findByPk(listingId).then((listing) => {
      if (!listing) {
        return false;
      }
      listing.status = statusId;
      return listing
        .save(() => {
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    });
  }

  deleteListing(listingId) {
    return Listing.findByPk(listingId)
      .then((listing) => {
        return listing
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

  verifyListingOwner(userId, listingId) {
    return Listing.findByPk(listingId).then((listing) => {
      if (!listing) {
        return false;
      }
      if (userId != listing.owner_id) {
        return false;
      }
      return true;
    });
  }

  isFavoriteListing(userId, listingId) {
    return FavoriteListing.count({
      where: {
        user_id: userId,
        listing_id: listingId,
      },
    })
      .then((cnt) => {
        if (cnt > 0) {
          return true;
        } else {
          return false;
        }
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }
}

function getRangeInKm(latitude, longitude, radiusInKm) {
  let kmInLongitudeDegree = 111.32 * Math.cos((latitude / 180.0) * Math.PI);

  let deltaLat = radiusInKm / 111.1;
  let deltaLong = radiusInKm / kmInLongitudeDegree;

  let minLat = latitude - deltaLat;
  let maxLat = latitude + deltaLat;
  let minLng = longitude - deltaLong;
  let maxLng = longitude + deltaLong;
  return {
    minLat: minLat,
    maxLat: maxLat,
    minLng: minLng,
    maxLng: maxLng,
  };
}

function getFindListingQueryOptions(conditions, type) {
  let latitude = conditions.latitude;
  let longitude = conditions.longitude;
  let radius = conditions.radius;

  if (!latitude || !longitude || !radius) {
    return undefined;
  }
  let range = getRangeInKm(latitude, longitude, radius);

  let queryOptions = {
    latitude: {
      [Op.and]: [{ [Op.gte]: range.minLat }, { [Op.lte]: range.maxLat }],
    },
    longitude: {
      [Op.and]: [{ [Op.gte]: range.minLng }, { [Op.lte]: range.maxLng }],
    },
  };

  let minPrice = 0;
  let maxPrice = Number.MAX_SAFE_INTEGER;
  if (conditions.minPrice && conditions.minPrice > 0) {
    minPrice = conditions.minPrice;
  }
  if (conditions.maxPrice && maxPrice > 0) {
    maxPrice = conditions.maxPrice;
  }

  if ((type = HouseSearchType.RENT.id)) {
    queryOptions.rent_price = {
      [Op.or]: [{ [Op.between]: [minPrice, maxPrice] }, { [Op.is]: null }],
    };
  } else if ((type = HouseSearchType.SALE.id)) {
    queryOptions.sale_price = {
      [Op.or]: [{ [Op.between]: [minPrice, maxPrice] }, { [Op.is]: null }],
    };
  } else if ((type = HouseSearchType.ALL.id)) {
    queryOptions.sale_price = {
      [Op.ne]: null,
    };
    queryOptions.rent_price = {
      [Op.ne]: null,
    };
  }

  let bedrooms = conditions.bedrooms;
  if (bedrooms && bedrooms > 0) {
    queryOptions.rooms = { [Op.gte]: bedrooms };
  }
  let bathrooms = conditions.bathrooms;
  if (bathrooms && bathrooms > 0) {
    queryOptions.bath_rooms = { [Op.gte]: bathrooms };
  }
  queryOptions.status = ListingStatus.AVAILABLE.id;
  console.log(queryOptions);
  return queryOptions;
}

module.exports = new ListingService();
