const resTemplate = require("../static/ResponseTemplate");
const TenantGroupService = require("../services/TenantGroupService");
const { User } = require("../models/models");
const GroupMemberState = require("../../common/Constans/GroupMemberState");
const ListingService = require("../services/ListingService");
const ApplicationService = require("../services/ApplicationService");

class GroupController {
  // Group CRUD
  createGroup(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }

    let name = req.body.name;
    let description = req.body.description;

    if (!name || !description) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    let groupInfo = {
      name: name,
      description: description,
    };

    TenantGroupService.createGroup(user.id, groupInfo).then((result) => {
      if (result) {
        res.json(
          Object.assign({}, resTemplate.SUCCESS, { data: { groupId: result } })
        );
      } else {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }

  updateGroup(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }

    let name = req.body.name;
    let description = req.body.description;
    let groupId = req.body.groupId;
    if (!groupId || (!name && !description)) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupOnwer(user.id, groupId).then((approved) => {
      if (approved) {
        let groupInfo = {};
        if (name) {
          groupInfo.name = name;
        }
        if (description) {
          groupInfo.description = description;
        }
        TenantGroupService.updateGroup(user.id, groupId, groupInfo).then(
          (result) => {
            if (result) {
              res.json(resTemplate.SUCCESS);
            } else {
              res.status(500).json(resTemplate.DATABASE_ERROR);
            }
          }
        );
      } else {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
    });
  }

  deleteGroup(req, res) {
    let groupId = req.params.id;
    let user = req.body.user;

    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }

    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.verifyGroupOnwer(user.id, groupId).then((approved) => {
      if (approved) {
        TenantGroupService.deleteGroup(user.id, groupId).then((result) => {
          if (result) {
            res.json(resTemplate.SUCCESS);
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        });
      } else {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
    });
  }

  async getGroup(req, res) {
    let groupId = req.params.id;
    let user = req.body.user;

    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    var group = undefined;
    if (user) {
      await TenantGroupService.getGroupMemberState(user.id, groupId).then(
        async (stateId) => {
          if (
            stateId == GroupMemberState.APPROVED.id ||
            stateId == GroupMemberState.OWNER.id
          ) {
            await TenantGroupService.getGroupDetail(groupId).then((result) => {
              group = result;
            });
          } else if (stateId == GroupMemberState.HOUSE_OWNER.id) {
            await TenantGroupService.getGroupMemberDetail(groupId).then(
              (result) => {
                group = result;
              }
            );
          } else if (stateId == undefined) {
            // guest
            await TenantGroupService.getGroupDescription(groupId).then(
              (result) => {
                group = result;
              }
            );
          }
        }
      );
    } else {
      await TenantGroupService.getGroupDescription(groupId).then((result) => {
        group = result;
      });
    }

    if (group) {
      res.json(Object.assign({}, resTemplate.SUCCESS, { data: group }));
    } else {
      res.status(404).json(resTemplate.NO_DATA);
    }
  }

  findAllGroup(req, res) {
    TenantGroupService.findAllGroups().then((groups) => {
      if (groups == undefined) {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
      res.json(Object.assign({}, resTemplate.SUCCESS, { data: groups }));
    });
  }

  // to get groups that an user is in
  getUserGroups(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    TenantGroupService.getUserGroupList(user.id).then((result) => {
      if (result) {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      } else {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }

  // Members
  // invite
  inviteTenant(req, res) {
    let owner = req.body.user;
    if (!owner) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.body.groupId;
    let email = req.body.email;
    let userId = req.body.userId;
    if (!groupId || (!email && !userId)) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    let queryCondition = {};
    if (userId) {
      queryCondition.id = userId;
    } else if (email) {
      queryCondition.email = email;
    }

    TenantGroupService.verifyGroupOnwer(owner.id, groupId).then((approved) => {
      if (approved) {
        User.findOne({ where: queryCondition }).then((invitee) => {
          if (!invitee) {
            res.status(404).json(resTemplate.USER_NOT_EXIST);
            return;
          }
          TenantGroupService.inviteTenant(groupId, invitee.id).then(
            (result) => {
              if (result) {
                res.json(resTemplate.SUCCESS);
              } else {
                res.status(500).json(resTemplate.FAIL);
              }
            }
          );
        });
      } else {
        res.status(401).json(resTemplate.PERMISSION_DENY);
      }
    });
  }
  // accept/reject invite
  acceptInvitation(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.respondInvitation(user.id, groupId, true).then(
      (result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else {
          res.status(500).json(resTemplate.FAIL);
        }
      }
    );
  }
  rejectInvitation(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.respondInvitation(user.id, groupId, false).then(
      (result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        }
      }
    );
  }
  // apply
  applyGroup(req, res) {
    let user = req.body.user;
    let groupId = req.params.groupId;

    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }

    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.applyGroup(user.id, groupId).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else if (result == undefined) {
        res.status(404).json(resTemplate.NO_DATA);
      }
    });
  }
  // accept/deny apply
  respondApplication(req, res) {
    let owner = req.body.user;
    let groupId = req.body.groupId;
    let applicantId = req.body.applicantId;
    let approved = req.body.approved;

    if (!owner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    if (!groupId || !applicantId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    if (isNaN(parseInt(groupId)) || isNaN(parseInt(applicantId))) {
      res.status(400).json(resTemplate.INVALID_INPUT);
      return;
    }

    if (approved == undefined) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.verifyGroupOnwer(owner.id, groupId).then(
      (isGroupOwner) => {
        if (!isGroupOwner) {
          res.status(403).json(resTemplate.PERMISSION_DENY);
        }

        TenantGroupService.respondWaitingTenant(
          groupId,
          applicantId,
          approved
        ).then((result) => {
          if (result) {
            res.json(resTemplate.SUCCESS);
          } else {
            res.status(404).json(resTemplate.NO_DATA);
          }
        });
      }
    );
  }

  // [Group Owner] get waiting tenants
  getWaitingTenants(req, res) {
    let owner = req.body.user;
    if (!owner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }

    let groupId = req.params.groupId;

    if (!groupId || isNaN(parseInt(groupId))) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupOnwer(owner.id, groupId).then((isOwner) => {
      if (!isOwner) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      TenantGroupService.getWaitingTenants(groupId).then((result) => {
        if (!result) {
          res.status(500).json(resTemplate.DATABASE_ERROR);
          return;
        }
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      });
    });
  }
  // [Applicant] get applying groups
  getApplyingGroups(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }

    TenantGroupService.getUserApllyingGroups(user.id)
      .then((result) => {
        if (result == undefined) {
          res.status(500).json(resTemplate.DATABASE_ERROR);
          return;
        }
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(resTemplate.DATABASE_ERROR);
      });
  }

  cancelApplication(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId || isNaN(parseInt(groupId))) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.cancelApplication(user.id, groupId).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(404).json(resTemplate.NO_DATA);
      }
    });
  }

  putMessage(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId || isNaN(parseInt(groupId))) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    let message = req.body.message;
    if (!message || message.length == 0) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupMember(user.id, groupId).then((isMember) => {
      if (!isMember) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      TenantGroupService.putMessage(user.id, groupId, message).then(
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

  getGroupInvitees(req, res) {
    let owner = req.body.user;
    if (!owner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId || isNaN(parseInt(groupId))) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.verifyGroupOnwer(owner.id, groupId).then((approved) => {
      if (!approved) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }

      TenantGroupService.getGroupInvitation(groupId).then((result) => {
        if (result == undefined) {
          res.status(500).json(resTemplate.DATABASE_ERROR);
          return;
        }
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      });
    });
  }

  getInvitations(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    TenantGroupService.getUserInvitation(user.id).then((invitations) => {
      if (invitations == undefined) {
        res.status(500).json(resTemplate.DATABASE_ERROR);
        return;
      }
      res.json(Object.assign({}, resTemplate.SUCCESS, { data: invitations }));
    });
  }

  // ================================================
  addListingToGroup(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let listingId = req.body.listingId;
    let groupId = req.body.groupId;
    if (!listingId || !groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.verifyGroupMember(user.id, groupId).then((isMember) => {
      if (!isMember) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      TenantGroupService.addListingToGroup(user.id, groupId, listingId).then(
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

  approveListing(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let listingId = req.body.listingId;
    let groupId = req.body.groupId;
    if (!listingId || !groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupMember(user.id, groupId).then((isMember) => {
      if (!isMember) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      TenantGroupService.approveListing(user.id, groupId, listingId).then(
        (result) => {
          if (result) {
            res.json(resTemplate.SUCCESS);
          } else if (result == false) {
            res.status(404).json(resTemplate.FAIL);
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        }
      );
    });
  }

  withdrawApproment(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let listingId = req.body.listingId;
    let groupId = req.body.groupId;
    if (!listingId || !groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    TenantGroupService.withdrawApprove(user.id, groupId, listingId).then(
      (result) => {
        if (result) {
          res.json(resTemplate.SUCCESS);
        } else if (result == false) {
          res.status(404).json(resTemplate.NO_DATA);
        } else {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        }
      }
    );
  }

  getApprovedMember(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let listingId = req.body.listingId;
    let groupId = req.body.groupId;
    if (!listingId || !groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupMember(user.id, groupId).then((isMember) => {
      if (!isMember) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }
      TenantGroupService.getApprovedMember(groupId, listingId).then(
        (result) => {
          if (result) {
            res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        }
      );
    });
  }

  getGroupListings(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.params.groupId;
    if (!groupId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupMember(user.id, groupId).then((isMember) => {
      if (!isMember) {
        res.status(403).json(resTemplate.PERMISSION_DENY);
        return;
      }

      TenantGroupService.getGroupListings(groupId).then((listings) => {
        if (listings) {
          for (var i = 0; i < listings.length; i++) {
            let listing = listings[i];
            if (listing.approvements == null) {
              listing.approvements = 0;
            }
            if (listing.approvers.includes(user.id)) {
              listing.isApproved = true;
            } else {
              listing.isApproved = false;
            }
          }
          res.json(Object.assign({}, resTemplate.SUCCESS, { data: listings }));
        } else {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        }
      });
    });
  }

  groupApplyListing(req, res) {
    let groupOwner = req.body.user;
    if (!groupOwner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.body.groupId;
    let description = req.body.description;
    let listingId = req.body.listingId;
    if (!groupId || !listingId || !description || description.length == 0) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupOnwer(groupOwner.id, groupId).then(
      (isOwner) => {
        if (!isOwner) {
          res.status(403).json(resTemplate.PERMISSION_DENY);
          return;
        }
        ListingService.getListingById(listingId).then((listing) => {
          if (!listing) {
            res.status(404).json(resTemplate.NO_DATA);
            return;
          }
          ApplicationService.applyListing(
            groupId,
            listing.owner_id,
            listingId,
            description
          ).then((application) => {
            if (application) {
              res.json(resTemplate.SUCCESS);
            } else {
              res.status(500).json(resTemplate.DATABASE_ERROR);
            }
          });
        });
      }
    );
  }

  updateApplicationDescription(req, res) {
    let groupOwner = req.body.user;
    if (!groupOwner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.body.groupId;
    let description = req.body.description;
    let listingId = req.body.listingId;
    if (!groupId || !listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupOnwer(groupOwner.id, groupId).then(
      (isOwner) => {
        if (!isOwner) {
          res.status(403).json(resTemplate.PERMISSION_DENY);
          return;
        }
        ApplicationService.updateApplication(
          groupId,
          listingId,
          description
        ).then((application) => {
          if (application) {
            res.json(resTemplate.SUCCESS);
          } else {
            res.status(500).json(resTemplate.DATABASE_ERROR);
          }
        });
      }
    );
  }

  deleteApplication(req, res) {
    let groupOwner = req.body.user;
    if (!groupOwner) {
      res.status(401).json(resTemplate.TOKEN_ERR);
      return;
    }
    let groupId = req.body.groupId;
    let listingId = req.body.listingId;
    if (!groupId || !listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    TenantGroupService.verifyGroupOnwer(groupOwner.id, groupId).then(
      (isOwner) => {
        if (!isOwner) {
          res.status(403).json(resTemplate.PERMISSION_DENY);
          return;
        }
        ApplicationService.deleteApplication(groupId, listingId).then(
          (application) => {
            if (application) {
              res.json(resTemplate.SUCCESS);
            } else {
              res.status(500).json(resTemplate.DATABASE_ERROR);
            }
          }
        );
      }
    );
  }

  getOwnerGroup(req, res) {
    let ownerId = req.params.id;
    TenantGroupService.getOwnerGroup(ownerId).then((result) => {
      if (result != undefined) {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      } else res.status(404).json(resTemplate.NO_DATA);
    });
  }
}

module.exports = new GroupController();
