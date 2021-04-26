const { UsZipCode } = require("../models/models");

let zipCodeMap = new Map();
let cityZipMap = new Map();

class ZipCodeUtil {
  constructor() {
    UsZipCode.findAll({
      row: true,
      attributes: ["zip", "state", "city"],
    }).then((zips) => {
      for (var i = 0; i < zips.length; i++) {
        let area = zips[i];
        let city = canonicalizeCityState(area.city, area.state);
        zipCodeMap.set(area.zip, { state: area.state, city: area.city });

        if (cityZipMap.has(city)) {
          cityZipMap.get(city).push(area.zip);
        } else {
          cityZipMap.set(city, [area.zip]);
        }
      }
    });
  }

  getCityStateByZipCode(zipcode) {
    return zipCodeMap.get(zipcode);
  }

  getZipCodesByCityState(city, state) {
    return cityZipMap.get(canonicalizeCityState(city, state));
  }

  isZipCodeValid(zipcode) {
    return zipCodeMap.has(zipcode);
  }

  isCityStateValid(city, state) {
    return cityZipMap.has(canonicalizeCityState(city, state));
  }
}

function canonicalizeCityState(city, state) {
  return city + "," + state;
}

module.exports = new ZipCodeUtil();
