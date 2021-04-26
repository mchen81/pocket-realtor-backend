const constant = require("../static/Constant");
const resTemplate = require("../static/ResponseTemplate");
const jwt = require("jsonwebtoken");
const regex = require("../static/Regex");
const UserService = require("../services/UserService");
const HistoryService = require("../services/HistoryService");
const RoleType = require("../static/RoleType");

class UserController {
  constructor() {}

  register(req, res, next) {
    let email = req.body.email;
    var password = req.body.password;
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    if (!email || !password || !firstname || !lastname) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    if (!isEmailLegal(email)) {
      res.status(400).json(resTemplate.INVALID_EMAIL);
      return;
    }

    if (!isPasswordLegal(password)) {
      res.status(400).json(resTemplate.INVALID_PASSWORD);
      return;
    }

    UserService.isEamilExist(email).then((exist) => {
      if (exist) {
        res.status(409).json(resTemplate.EMAIL_EXIST);
        return;
      }
      let user = {
        email: email,
        password: password,
        firstname: firstname,
        lastname: lastname,
      };
      UserService.register(user).then((result) => {
        if (result) {
          res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
        } else {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        }
      });
    });
  }

  login(req, res, next) {
    let email = req.body.email;
    let password = req.body.password;

    if (!email || !password) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    UserService.isEamilExist(email).then((exist) => {
      if (!exist) {
        res.status(404).json(resTemplate.USER_NOT_EXIST);
        return;
      }

      UserService.login(email, password).then((result) => {
        if (result == false) {
          res.status(404).json(resTemplate.USER_NOT_EXIST);
        } else if (result == undefined) {
          res.status(500).json(resTemplate.DATABASE_ERROR);
        } else {
          res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
        }
      });
    });
  }

  // just for dev
  testUserToken(req, res, next) {
    res.json(req.body.user);
  }

  updateRole(req, res, next) {
    let reqUser = req.body.user;

    if (!reqUser || !reqUser.id) {
      res.status(403).send("Lose user id in jwt");
      return;
    }

    let roleType = {
      isHost: req.body.isHost,
      isRenter: req.body.isRenter,
      isAgent: req.body.isAgent,
    };

    if (!roleType.isHost && !roleType.isRenter && !roleType.isAgent) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    UserService.updateRole(reqUser.id, roleType).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).json(resTemplate.FAIL);
      }
    });
  }

  updatePassword(req, res, next) {
    let reqUser = req.body.user;
    let userId = reqUser.id;
    let oldPwd = req.body.oldPassword;
    let newPwd = req.body.newPassword;

    if (!reqUser) {
      res.status(400).send("Missing token");
      return;
    }

    if (!userId || !oldPwd || !newPwd) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    UserService.updatePassword(userId, oldPwd, newPwd).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else if (result == false) {
        res.status(400).json(resTemplate.INVALID_PASSWORD);
      } else if (result == undefined) {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }

  updateProfile(req, res, next) {
    let reqUserId = req.body.user.id;

    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let birthday = req.body.birthday;
    let nickname = req.body.nickname;
    let intro = req.body.intro;
    let gender = req.body.gender;
    let occupation = req.body.occupation;

    if (!reqUserId) {
      res.status(400).send("Lose user id in jwt");
      return;
    }

    let profile = {};
    if (firstname) {
      profile.firstname = firstname;
    }

    if (lastname) {
      profile.lastname = lastname;
    }

    if (birthday) {
      profile.birthday = birthday;
    }

    if (nickname) {
      profile.nickname = nickname;
    }

    if (intro) {
      profile.intro = intro;
    }

    if (gender) {
      profile.gender = gender;
    }

    if (occupation) {
      profile.occupation = occupation;
    }

    UserService.updateProfile(reqUserId, profile).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else if (result == false) {
        res.status(400).json(resTemplate.FAIL);
      } else if (result == undefined) {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }

  getUserProfile(req, res, next) {
    let userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      res.status(400).send("UserId is missing");
      return;
    }

    if (!userId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    UserService.getUserById(userId).then(async (user) => {
      if (!user) {
        res.status(404).json(resTemplate.USER_NOT_EXIST);
        return;
      }
      let responseBody = { data: user };
      if (req.body.user) {
        if (req.body.user.id == userId) {
          responseBody.data.history = {
            tenants: await HistoryService.getViewedTenants(userId),
            listings: await HistoryService.getViewedListings(userId),
          };
        } else {
          HistoryService.viewTenant(req.body.user.id, userId);
        }
      }
      res.json(Object.assign({}, resTemplate.SUCCESS, responseBody));
    });
  }

  getUserRole(req, res, next) {
    let userId = req.params.userId;

    if (!userId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }

    UserService.getUserRoles(userId)
      .then((roles) => {
        console.log(roles);
        let userrole = {
          isRenter: false,
          isHost: false,
          isAgent: false,
        };
        for (var i = 0; i < roles.length; i++) {
          let role = roles[i];
          if (role.role_id == RoleType.RENTER.id) {
            userrole.isRenter = true;
          } else if (role.role_id == RoleType.HOST.id) {
            userrole.isHost = true;
          } else if (role.role_id == RoleType.AGENT.id) {
            userrole.isAgent = true;
          }
        }

        res.json(Object.assign({}, resTemplate.SUCCESS, { data: userrole }));
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  }

  updateAvatar(req, res, next) {
    let userId = req.body.user.id;
    let avatar = req.body.avatar;
    if (!userId) {
      res.status(403).send("Lose user id in jwt");
    }
    UserService.updateUserAvatar(userId, avatar).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).send("Fail to update avatar");
      }
    });
  }

  verifyToken(req, res, next) {
    const token = req.header("Authorization");
    jwt.verify(token, constant.jwtsecret, function (err, decoded) {
      if (err) {
        res.status(403).json(resTemplate.TOKEN_ERR);
        return;
      } else {
        // check user info
        let decodedUser = decoded.user;
        if (!decodedUser) {
          res.status(403).json(resTemplate.TOKEN_ERR);
          return;
        }

        let userId = decodedUser.id;
        let email = decodedUser.email;
        let pwdHash = decodedUser.hash;

        if (!userId || !email || !pwdHash) {
          console.log("Token Fields Missed");
          res.status(403).json(resTemplate.TOKEN_ERR);
          return;
        }

        UserService.isUserValid(userId, email, pwdHash)
          .then((user) => {
            if (!user) {
              res.status(401).json(resTemplate.TOKEN_ERR);
              return;
            }
            req.body.user = user;
            next();
          })
          .catch((err) => {
            console.log(err);
            res.status(500).catch("Fail to examine the jwt token");
          });
      }
    });
  }

  interpretToken(req, res, next) {
    let token = req.header("Authorization");
    if (token == undefined) {
      next();
    }
    jwt.verify(token, constant.jwtsecret, function (err, decoded) {
      if (err) {
        next();
      } else {
        console.log(decoded);
        let decodedUser = decoded.user;
        if (!decodedUser) {
          next();
        }
        req.body.user = decodedUser;
        next();
      }
    });
  }

  cleanTenantHistory(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.PERMISSION_DENY);
      return;
    }
    HistoryService.cleanViewedTenant(user.id).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).send("Fail to delete history");
      }
    });
  }

  cleanListingHistory(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.PERMISSION_DENY);
      return;
    }
    HistoryService.cleanViewdListings(user.id).then((result) => {
      if (result) {
        res.json(resTemplate.SUCCESS);
      } else {
        res.status(500).send("Fail to delete history");
      }
    });
  }
}

function isEmailLegal(email) {
  const re = regex.EMAIL;
  const result = re.test(email);
  return result;
}

function isPasswordLegal(password) {
  // const re =  /^[A-Za-z]\w{7,14}$/; // between 7 to 16 characters and contain only characters, numeric digits, underscore and first character must be a letter
  const re = regex.PASSWORD1;
  const result = re.test(password);
  return result;
}

function isEmailLegal(email) {
  const re = regex.EMAIL;
  const result = re.test(email);
  return result;
}

function isPasswordLegal(password) {
  // const re =  /^[A-Za-z]\w{7,14}$/; // between 7 to 16 characters and contain only characters, numeric digits, underscore and first character must be a letter
  const re = regex.PASSWORD1;
  const result = re.test(password);
  return result;
}

module.exports = new UserController();
