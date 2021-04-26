const { Sequelize } = require("sequelize");
const ApplicationState = require("../../common/Constans/ApplicationState");
const GroupMemberState = require("../../common/Constans/GroupMemberState");
const listingApplication = require("../models/listingApplication");
const {
  User,
  TenantGroups,
  GroupMembers,
  Listing,
  TenantGroupListings,
  GroupChatRoom,
  ListingApplications,
} = require("../models/models");
const ListingService = require("./ListingService");
const TenantGroupService = require("./TenantGroupService");

class ApplicationService {
  applyListing(groupId, listing_owner_id, listingId, description) {
    return ListingApplications.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((application) => {
      if (application) {
        return false;
      }
      return ListingApplications.create({
        group_id: groupId,
        listing_id: listingId,
        description: description,
        state: ApplicationState.PENDING.id,
      }).then(() => {
        TenantGroupService.updateListingState(
          groupId,
          listingId,
          ApplicationState.PENDING.id
        );
        GroupMembers.create({
          group_id: groupId,
          user_id: listing_owner_id,
          state: GroupMemberState.HOUSE_OWNER.id,
        });
        return true;
      });
    });
  }

  updateApplication(groupId, listingId, description) {
    return ListingApplications.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((application) => {
      if (!application) {
        return false;
      }
      application.description = description;
      return application.save().then(() => {
        return true;
      });
    });
  }

  deleteApplication(groupId, listingId) {
    return ListingApplications.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((application) => {
      if (!application) {
        return true;
      }
      return application.destroy().then(() => {
        return ListingService.getListingById(listingId).then((listing) => {
          console.log("owner = " + listing.owner_id);
          return GroupMembers.destroy({
            where: {
              group_id: groupId,
              user_id: listing.owner_id,
              state: GroupMemberState.HOUSE_OWNER.id,
            },
          }).then(() => {
            return TenantGroupService.updateListingState(
              groupId,
              listingId,
              ApplicationState.NA.id
            ).then(() => {
              return true;
            });
          });
        });
      });
    });
  }

  changeApplicationState(groupId, listingId, stateId) {
    return ListingApplications.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((application) => {
      if (!application) {
        return undefined;
      }
      application.state = stateId;
      application
        .save()
        .then(() => {
          TenantGroupService.updateListingState(groupId, listingId, stateId);
          return true;
        })
        .catch((err) => {
          console.log(err);
          return false;
        });
    });
  }

  getApplicationsByListingId(listingId) {
    return ListingApplications.findAll({
      raw: true,
      attributes: [
        ["group_id", "groupId"],
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
        "state",
        ["created_at", "applyAt"],
      ],
      where: {
        listing_id: listingId,
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
      order: [["created_at", "DESC"]],
    }).then((groups) => {
      return groups;
    });
  }
}
module.exports = new ApplicationService();
