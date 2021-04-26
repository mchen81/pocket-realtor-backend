const {
  User,
  TenantGroups,
  GroupMembers,
  Listing,
  TenantGroupListings,
  GroupChatRoom,
  ListingApplications,
} = require("../models/models");
const { Sequelize } = require("sequelize");
const { uuid } = require("uuidv4");
const GroupMemberState = require("../../common/Constans/GroupMemberState");
const ApplicationState = require("../../common/Constans/ApplicationState");

class TenantGroupService {
  // owner
  // create a group
  createGroup(ownerId, groupInfo) {
    let name = groupInfo.name;
    let description = groupInfo.description;

    let newGroup = {
      name: name,
      description: description,
      notes: [],
      owner_id: ownerId,
    };

    return TenantGroups.create(newGroup)
      .then((group) => {
        if (group) {
          GroupMembers.create({
            group_id: group.id,
            user_id: ownerId,
            state: GroupMemberState.OWNER.id,
          });
          let chatRoomId = uuid();
          GroupChatRoom.create({
            id: chatRoomId,
            group_id: group.id,
            messages: [],
          });

          return group.id;
        } else {
          return undefined;
        }
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  // update a group's information
  updateGroup(ownerId, groupId, groupInfo) {
    let name = groupInfo.name;
    let description = groupInfo.description;

    return TenantGroups.findByPk(groupId).then((group) => {
      if (group.owner_id !== ownerId) {
        console.log("ownerId is different from the id in database");
        return undefined;
      }
      if (name) {
        group.name = name;
      }
      if (description) {
        group.description = description;
      }
      return group
        .save()
        .then(() => {
          return true;
        })
        .catch((err) => {
          console.log(err);
          return undefined;
        });
    });
  }
  // delete a group
  deleteGroup(ownerId, groupId) {
    return TenantGroups.findByPk(groupId).then((group) => {
      if (group.owner_id !== ownerId) {
        console.log("ownerId is different from the id in database");
        return undefined;
      }
      return group
        .destroy()
        .then(() => {
          return true;
        })
        .catch((err) => {
          console.log(err);
          return undefined;
        });
    });
  }

  // get a group
  getGroupDescription(groupId) {
    return TenantGroups.findByPk(groupId)
      .then(async (group) => {
        if (!group) {
          console.log("Cannot find the group");
          return undefined;
        }

        let groupInfo = {
          id: group.id,
          name: group.name,
          description: group.description,
        };

        let ownerId = group.owner_id;

        await GroupMembers.count({
          where: {
            group_id: group.id,
            state: [GroupMemberState.APPROVED.id, GroupMemberState.OWNER.id],
          },
        }).then((cnt) => {
          groupInfo.size = cnt;
        });

        await User.findByPk(ownerId).then((user) => {
          let owner = {
            id: user.id,
            name: user.first_name + " " + user.last_name,
            avatar: user.avatar,
          };
          groupInfo.owner = owner;
        });

        return groupInfo;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  findAllGroups() {
    return TenantGroups.findAll({
      raw: true,
      attributes: ["id", "name", "description"],
    })
      .then((groups) => {
        return groups;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  //getWaitingTenant
  getWaitingTenants(groupId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("user.id"), "id"],
        [Sequelize.col("user.first_name"), "firstname"],
        [Sequelize.col("user.last_name"), "lsstname"],
        [Sequelize.col("user.avatar"), "avatar"],
        [Sequelize.col("updated_at"), "applyAt"],
      ],
      where: {
        group_id: groupId,
        state: GroupMemberState.WAITING.id,
      },
      include: {
        model: User,
        attributes: [],
      },
      order: [["updated_at", "ASC"]],
    })
      .then((waitingUsers) => {
        return waitingUsers;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  // verify applications
  respondWaitingTenant(groupId, waitingUserId, approved) {
    return GroupMembers.findOne({
      where: {
        group_id: groupId,
        user_id: waitingUserId,
      },
    }).then((waitingUser) => {
      if (!waitingUser || waitingUser.state !== GroupMemberState.WAITING.id) {
        return false;
      }
      if (approved) {
        waitingUser.state = GroupMemberState.APPROVED.id;
        return waitingUser.save().then(() => {
          return true;
        });
      } else {
        return waitingUser.destroy().then(() => {
          return true;
        });
      }
    });
  }

  // invite others
  inviteTenant(groupId, inviteeId) {
    return GroupMembers.findOne({
      where: {
        user_id: inviteeId,
        group_id: groupId,
      },
    })
      .then((member) => {
        if (member) {
          return true;
        }
        return GroupMembers.create({
          group_id: groupId,
          user_id: inviteeId,
          state: GroupMemberState.INVITED.id,
        }).then(() => {
          return true;
        });
      })
      .catch((err) => {
        return undefined;
      });
  }

  // get invitation

  getGroupInvitation(groupId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("user.id"), "id"],
        [Sequelize.col("user.first_name"), "firstname"],
        [Sequelize.col("user.last_name"), "lastname"],
        [Sequelize.col("user.avatar"), "avatar"],
        [Sequelize.col("updated_at"), "invitedAt"],
      ],
      where: {
        group_id: groupId,
        state: GroupMemberState.INVITED.id,
      },
      include: {
        model: User,
        attributes: [],
      },
      order: [["updated_at", "ASC"]],
    })
      .then((invitees) => {
        return invitees;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getUserInvitation(userId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("tenant_group.id"), "groupId"],
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
        [Sequelize.col("created_at"), "invitedAt"],
      ],
      where: {
        user_id: userId,
        state: GroupMemberState.INVITED.id,
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
    })
      .then((invitations) => {
        return invitations;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  // members
  // apply a group
  applyGroup(userId, groupId) {
    return TenantGroups.findByPk(groupId).then((group) => {
      if (!group) {
        console.log("Cannot find the group");
        return undefined;
      }

      return GroupMembers.findOne({
        where: {
          user_id: userId,
          group_id: groupId,
        },
      }).then((application) => {
        if (application) {
          return true;
        }
        return GroupMembers.create({
          user_id: userId,
          group_id: groupId,
          state: GroupMemberState.WAITING.id,
        }).then(() => {
          return true;
        });
      });
    });
  }

  // get the groups that the user has applied
  getUserApllyingGroups(userId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("tenant_group.id"), "id"],
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
        [Sequelize.col("created_at"), "applyAt"],
      ],
      where: {
        user_id: userId,
        state: GroupMemberState.WAITING.id,
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
      order: [["created_at", "ASC"]],
    })
      .then((groups) => {
        console.log(groups);
        return groups;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  cancelApplication(userId, groupId) {
    return GroupMembers.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        state: GroupMemberState.WAITING.id,
      },
    })
      .then((application) => {
        if (!application) {
          return false;
        }
        return application.destroy().then(() => {
          return true;
        });
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  getGroupMemberDetail(groupId) {
    return TenantGroups.findByPk(groupId)
      .then(async (group) => {
        if (!group) {
          console.log("Cannot find the group");
          return undefined;
        }

        let groupInfo = {
          id: group.id,
          name: group.name,
          description: group.description,
        };

        return GroupMembers.findAll({
          raw: true,
          attributes: ["user_id"],
          where: {
            group_id: group.id,
            state: [GroupMemberState.APPROVED.id, GroupMemberState.OWNER.id],
          },
        }).then((approvedMembers) => {
          let ids = [];
          for (var i = 0; i < approvedMembers.length; i++) {
            ids.push(approvedMembers[i].user_id);
          }
          return User.findAll({
            raw: true,
            attributes: [
              "id",
              ["first_name", "firstname"],
              ["last_name", "lastname"],
              "avatar",
            ],
            where: {
              id: ids,
            },
          }).then((members) => {
            groupInfo.members = members;
            return groupInfo;
          });
        });
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getGroupDetail(groupId) {
    return TenantGroups.findByPk(groupId, {
      include: {
        model: User,
        attributes: ["id", "first_name", "last_name", "avatar"],
      },
    }).then(async (group) => {
      if (!group) {
        return undefined;
      }
      let result = {};
      result.id = groupId;
      result.name = group.name;
      result.description = group.description;
      result.notes = group.notes;
      result.owner = {
        id: group.user.id,
        firstname: group.user.first_name,
        lastname: group.user.last_name,
        avatar: group.user.avatar,
      };

      await GroupMembers.findAll({
        raw: true,
        attributes: [
          [Sequelize.col("user.id"), "id"],
          [Sequelize.col("user.first_name"), "firstname"],
          [Sequelize.col("user.last_name"), "lastname"],
          [Sequelize.col("user.avatar"), "avatar"],
          [Sequelize.col("updated_at"), "addedAt"],
        ],
        where: {
          group_id: groupId,
          state: GroupMemberState.APPROVED.id,
        },
        include: {
          model: User,
          attributes: [],
        },
        order: [["updated_at", "ASC"]],
      }).then((members) => {
        result.members = members;
      });

      return result;
    });
  }

  getUserGroupList(userId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("tenant_group.id"), "id"],
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
        [Sequelize.col("updated_at"), "addedAt"],
      ],
      where: {
        user_id: userId,
        state: [GroupMemberState.APPROVED.id, GroupMemberState.OWNER.id],
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
    })
      .then((groups) => {
        return groups;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  respondInvitation(userId, groupId, accept) {
    return GroupMembers.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        state: GroupMemberState.INVITED.id,
      },
    }).then((invitee) => {
      if (!invitee) {
        return false;
      }
      if (accept) {
        invitee.state = GroupMemberState.APPROVED.id;
        return invitee
          .save()
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      } else {
        return invitee
          .destroy()
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      }
    });
  }

  //TODO: leave a group
  leaveGroup(userId, groupId) {}

  // all people
  // put a message (note)
  async putMessage(userId, groupId, message) {
    let date = new Date();
    let note = {
      message: message,
      date: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
      time: [date.getHours(), date.getMinutes(), date.getSeconds()].join(":"),
    };

    return User.findByPk(userId).then((user) => {
      note.user = {
        id: user.id,
        firstname: user.first_name,
        last_name: user.last_name,
        avatar: user.avatar,
      };

      return TenantGroups.findByPk(groupId).then((group) => {
        if (!group) {
          return false;
        }

        return TenantGroups.update(
          {
            notes: Sequelize.fn(
              "array_append",
              Sequelize.col("notes"),
              JSON.stringify(note)
            ),
          },
          { where: { id: groupId } }
        )
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      });
    });
  }

  addListingToGroup(userId, groupId, listingId) {
    return this.verifyGroupMember(userId, groupId).then((isGroupMember) => {
      if (!isGroupMember) {
        return false;
      }

      return TenantGroupListings.findOne({
        where: { group_id: groupId, listing_id: listingId },
      }).then((existedListing) => {
        if (existedListing) {
          return false;
        }
        return TenantGroupListings.create({
          group_id: groupId,
          listing_id: listingId,
          added_user_id: userId,
          approved_by: [],
          state: ApplicationState.NA.id,
        })
          .then((success) => {
            if (success) {
              return true;
            } else {
              return false;
            }
          })
          .catch((err) => {
            console.log(err);
            return undefined;
          });
      });
    });
  }

  updateListingState(groupId, listingId, stateId) {
    return TenantGroupListings.update(
      {
        state: stateId,
      },
      {
        where: {
          group_id: groupId,
          listing_id: listingId,
        },
      }
    )
      .then((success) => {
        if (success) {
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

  approveListing(userId, groupId, listingId) {
    return TenantGroupListings.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((groupListing) => {
      if (!groupListing) {
        return false;
      }
      let approvedUsers = new Set(groupListing.approved_by);
      if (approvedUsers.has(userId)) {
        return false;
      }
      return TenantGroupListings.update(
        {
          approved_by: Sequelize.fn(
            "array_append",
            Sequelize.col("approved_by"),
            userId
          ),
        },
        {
          where: {
            group_id: groupId,
            listing_id: listingId,
          },
        }
      )
        .then((result) => {
          if (result) {
            return true;
          } else {
            return false;
          }
        })
        .catch((err) => {
          console.log(err);
          return undefined;
        });
    });
  }

  withdrawApprove(userId, groupId, listingId) {
    return TenantGroupListings.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    })
      .then((groupListing) => {
        if (!groupListing) {
          return false;
        }
        let approvedUsers = Array.from(groupListing.approved_by);
        console.log(approvedUsers);
        for (var i = 0; i < approvedUsers.length; i++) {
          if (approvedUsers[i] == userId) {
            approvedUsers.splice(i, i + 1);
            groupListing.approved_by = approvedUsers;
            return groupListing.save().then((saved) => {
              return saved;
            });
          }
        }
        return false;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getApprovedMember(groupId, listingId) {
    return TenantGroupListings.findOne({
      where: {
        group_id: groupId,
        listing_id: listingId,
      },
    }).then((groupListing) => {
      let approvedUserIds = groupListing.approved_by;
      return User.findAll({
        attributes: [
          "id",
          ["first_name", "firstname"],
          ["last_name", "lastname"],
          "avatar",
        ],
        where: { id: approvedUserIds },
      }).then((users) => {
        return users;
      });
    });
  }

  getGroupListings(groupId) {
    return TenantGroupListings.findAll({
      raw: true,
      attributes: [
        [Sequelize.col("listing.id"), "id"],
        [Sequelize.col("listing.title"), "name"],
        [Sequelize.col("listing.description"), "description"],
        [Sequelize.col("approved_by"), "approvers"],
        [Sequelize.col("tenant_group_listings.state"), "state"],
        [
          Sequelize.fn("array_length", Sequelize.col("approved_by"), 1),
          "approvements",
        ],
      ],
      where: { group_id: groupId },
      include: {
        model: Listing,
        attributes: [],
      },
      order: [[Sequelize.col("approvements"), "DESC NULLS LAST"]],
    })
      .then((listings) => {
        return listings;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  verifyGroupOnwer(userId, groupId) {
    return TenantGroups.findByPk(groupId).then((group) => {
      if (!group) {
        console.log("Cannot Find the group: " + groupId);
        return false;
      }
      if (group.owner_id == userId) {
        return true;
      } else {
        return false;
      }
    });
  }

  verifyGroupMember(userId, groupId) {
    return GroupMembers.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
        state: [GroupMemberState.APPROVED.id, GroupMemberState.OWNER.id],
      },
    }).then((approved) => {
      if (approved) {
        return true;
      } else {
        return false;
      }
    });
  }

  getGroupMemberState(userId, groupId) {
    return GroupMembers.findOne({
      where: {
        user_id: userId,
        group_id: groupId,
      },
    }).then((member) => {
      if (!member) {
        return undefined;
      }
      return member.state;
    });
  }

  getOwnerGroup(userId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        ["group_id", "id"],
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
      ],
      where: {
        user_id: userId,
        state: GroupMemberState.OWNER.id,
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
    })
      .then((groups) => {
        return groups;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }
}

module.exports = new TenantGroupService();
