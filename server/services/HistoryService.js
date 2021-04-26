const { TenantHistory, User, Listing } = require("../models/models");
const HistoryType = require("../../common/Constans/TenantHistoryType");

class HistoryService {
  viewTenant(userId, tenantId) {
    if (userId == tenantId) {
      return;
    }
    if (!userId || !tenantId) {
      console.log("user id is undefined");
      return;
    }
    let now = new Date();
    User.findByPk(tenantId).then((tenant) => {
      if (!tenant) {
        return;
      }
      let name = tenant.first_name + " " + tenant.last_name;
      TenantHistory.findOne({
        where: {
          user_id: userId,
          type: HistoryType.TENANT.id,
          viewed_id: tenantId,
        },
      }).then((result) => {
        if (result) {
          result.viewed_time = now.getTime();
          result.save();
        } else {
          let history = {
            user_id: userId,
            type: HistoryType.TENANT.id,
            viewed_id: tenantId,
            viewed_name: name,
            viewed_time: now.getTime(),
          };
          TenantHistory.create(history);
        }
      });
    });
  }

  viewListing(userId, listingId) {
    if (!userId || !listingId) {
      return;
    }

    let now = new Date();
    Listing.findByPk(listingId).then((listing) => {
      if (!listing) {
        return;
      }
      TenantHistory.findOne({
        where: {
          user_id: userId,
          type: HistoryType.LISTING.id,
          viewed_id: listingId,
        },
      }).then((result) => {
        if (result) {
          result.viewed_time = now.getTime();
          result.save();
        } else {
          let history = {
            user_id: userId,
            type: HistoryType.LISTING.id,
            viewed_id: listingId,
            viewed_name: listing.title,
            viewed_time: now.getTime(),
          };
          TenantHistory.create(history);
        }
      });
    });
  }

  viewHost(userId, hostId) {
    if (userId == hostId) {
      return;
    }
    if (!userId || !hostId) {
      console.log("user id is undefined");
      return;
    }
    let now = new Date();
    User.findByPk(hostId).then((tenant) => {
      if (!tenant) {
        return;
      }
      let name = tenant.first_name + " " + tenant.last_name;
      TenantHistory.findOne({
        where: {
          user_id: userId,
          type: HistoryType.HOST.id,
          viewed_id: hostId,
        },
      }).then((result) => {
        if (result) {
          result.viewed_time = now.getTime();
          result.save();
        } else {
          let history = {
            user_id: userId,
            type: HistoryType.HOST.id,
            viewed_id: hostId,
            viewed_name: name,
            viewed_time: now.getTime(),
          };
          TenantHistory.create(history);
        }
      });
    });
  }

  async getViewedTenants(userId) {
    return await TenantHistory.findAll({
      where: { user_id: userId, type: HistoryType.TENANT.id },
      order: [["viewed_time", "DESC"]],
    }).then((histories) => {
      let result = [];
      for (var i = 0; i < histories.length; i++) {
        let history = histories[i];

        let date = new Date(new Number(history.viewed_time));
        console.log(date.getTime());
        let r = {
          tenantId: history.viewed_id,
          tenantName: history.viewed_name,
          date: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
          hour: date.getHours(),
          minute: date.getMinutes(),
        };
        result.push(r);
      }
      return result;
    });
  }

  getViewedHosts(userId) {}

  async getViewedListings(userId) {
    return await TenantHistory.findAll({
      where: { user_id: userId, type: HistoryType.LISTING.id },
      order: [["viewed_time", "DESC"]],
    }).then((histories) => {
      let result = [];
      for (var i = 0; i < histories.length; i++) {
        let history = histories[i];
        let date = new Date(new Number(history.viewed_time));
        let r = {
          listingId: history.viewed_id,
          title: history.viewed_name,
          date: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
          hour: date.getHours(),
          minute: date.getMinutes(),
        };
        result.push(r);
      }
      return result;
    });
  }

  cleanViewedTenant(userId) {
    return TenantHistory.destroy({
      where: {
        user_id: userId,
        type: HistoryType.TENANT.id,
      },
    })
      .then(() => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  cleanViewedHost(userId) {}

  cleanViewdListings(userId) {
    return TenantHistory.destroy({
      where: {
        user_id: userId,
        type: HistoryType.LISTING.id,
      },
    })
      .then(() => {
        return true;
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }
}

module.exports = new HistoryService();
