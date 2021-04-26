const RoleType = require("../static/RoleType");
const crypto = require("crypto");
const constant = require("../static/Constant");
const { User, UserRole } = require("../models/models");
const jwt = require("jsonwebtoken");
const config = require("../config");
class UserService {
  isEamilExist(email) {
    return User.count({ where: { email: email } }).then((cnt) => {
      if (cnt > 0) {
        return true;
      }
      return false;
    });
  }

  register(user) {
    var password = user.password;
    let salt = crypto.randomBytes(16).toString("hex");
    let hashedPassword = hashPassword(salt, password);

    let newUser = {
      email: user.email,
      password_salt: salt,
      password_hashed: hashedPassword,
      first_name: user.firstname,
      last_name: user.lastname,
    };

    return User.create(newUser)
      .then((user) => {
        let token = generateAuthToken({
          id: user.id,
          email: user.email,
          hash: hashedPassword,
        });
        return {
          token: token,
          id: user.id,
          firstname: user.first_name,
          lastname: user.last_name,
          avatar: "",
        };
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  login(email, password) {
    return User.findOne({ where: { email: email } })
      .then((user) => {
        if (!user) {
          return false;
        }
        let salt = user.password_salt;
        let hashedPassword = hashPassword(salt, password);
        if (hashedPassword === user.password_hashed) {
          let token = generateAuthToken({
            id: user.id,
            email: user.email,
            hash: hashedPassword,
          });
          return {
            token: token,
            id: user.id,
            firstname: user.first_name,
            lastname: user.last_name,
            avatar: user.avatar,
          };
        } else {
          return false;
        }
      })
      .catch((err) => {
        return undefined;
      });
  }

  updatePassword(userId, oldPwd, newPwd) {
    return User.findByPk(userId)
      .then((user) => {
        if (!user) {
          return false;
        }

        let salt = user.password_salt;
        // check old password
        if (user.password_hashed !== hashPassword(salt, oldPwd)) {
          return false;
        }
        // check new password
        if (!isPasswordLegal(newPwd)) {
          return false;
        }
        let newHashedPwd = hashPassword(salt, newPwd);
        user.password_hashed = newHashedPwd;
        user.save().then(() => {
          return true;
        });
      })
      .catch((err) => {
        return undefined;
      });
  }

  updateRole(userId, roleType) {
    return UserRole.destroy({ where: { user_id: userId } })
      .then(() => {
        if (roleType.isHost && roleType.isRenter) {
          UserRole.bulkCreate([
            {
              user_id: userId,
              role_id: RoleType.HOST.id,
            },
            {
              user_id: userId,
              role_id: RoleType.RENTER.id,
            },
          ]);
        } else if (roleType.isHost) {
          UserRole.create({
            user_id: userId,
            role_id: RoleType.HOST.id,
          });
        } else if (roleType.isRenter) {
          UserRole.create({
            user_id: userId,
            role_id: RoleType.RENTER.id,
          });
        } else if (roleType.isAgent) {
          UserRole.create({
            user_id: userId,
            role_id: RoleType.AGENT.id,
          });
        }
        return true;
      })
      .catch((err) => {
        return undefined;
      });
  }

  updateProfile(userId, profile) {
    return User.update(profile, { where: { id: userId } })
      .then((user) => {
        if (user) {
          return true;
        } else {
          return false;
        }
      })
      .catch((err) => {
        return undefined;
      });
  }

  getUserById(userId) {
    return User.findByPk(userId, {
      attributes: [
        "id",
        "email",
        ["first_name", "firstname"],
        ["last_name", "lastname"],
        "nickname",
        "birthday",
        "gender",
        "occupation",
        "intro",
        "avatar",
      ],
    })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getUserRoles(userId) {
    return UserRole.findAll({
      attributes: ["role_id"],
      raw: true,
      where: { user_id: userId },
    }).then((roles) => {
      return roles;
    });
  }

  async updateUserAvatar(userId, avatar) {
    return await User.findByPk(userId)
      .then((user) => {
        if (!user) {
          return false;
        }
        if (avatar) {
          user.avatar = avatar;
        } else {
          user.avatar = null;
        }
        return user.save().then(() => {
          return true;
        });
      })
      .catch((err) => {
        console.log(err);
        return false;
      });
  }

  async isUserValid(userId, email, hashedPassword) {
    return await User.findByPk(userId).then((user) => {
      if (
        !user ||
        userId !== user.id ||
        user.email !== email ||
        user.password_hashed !== hashedPassword
      ) {
        return undefined;
      }
      return user;
    });
  }

  async checkUserRole(userId, roleId) {
    return await this.getUserRoles(userId).then((roles) => {
      var isUserTheRole = false;
      for (var i = 0; i < roles.length; i++) {
        let role = roles[i];
        if (role.role_id === roleId) {
          isUserTheRole = true;
          break;
        }
      }
      return isUserTheRole;
    });
  }
}

const generateAuthToken = function (user) {
  let token = jwt.sign({ user: user }, constant.jwtsecret, {
    expiresIn: config.token_expire, // expire in a day
  });
  return token;
};

const hashPassword = function (salt, pwd) {
  var hmac = crypto.createHmac("sha256", salt);
  return hmac.update(pwd).digest("hex");
};

module.exports = new UserService();
