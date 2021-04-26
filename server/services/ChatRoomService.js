const {
  User,
  TenantGroups,
  GroupChatRoom,
  GroupMembers,
  PersonalChatRoom,
} = require("../models/models");
const { uuid } = require("uuidv4");
const { Op, Sequelize } = require("sequelize");
const GroupMemberState = require("../../common/Constans/GroupMemberState");
class ChatRoomService {
  findOrCreatePersonalChat(hostId, targetId, listingId) {
    var r1 = hostId;
    var r2 = targetId;
    if (targetId < hostId) {
      r1 = targetId;
      r2 = hostId;
    }

    return PersonalChatRoom.findOne({
      where: {
        recipient1: r1,
        recipient2: r2,
      },
    })
      .then((chatroom) => {
        if (!chatroom) {
          let chatroomId = uuid();
          return PersonalChatRoom.create({
            id: chatroomId,
            recipient1: r1,
            recipient2: r2,
            listing_id: listingId,
            messages: [],
          }).then((newPersonalChatRoom) => {
            return newPersonalChatRoom.id;
          });
        } else {
          if (chatroom.listing_id != listingId) {
            chatroom.listing_id = listingId;
            chatroom.save();
          }
          return chatroom.id;
        }
      })
      .catch((err) => {
        console.log(err);
        return undefined;
      });
  }

  getUserPersonalChatRooms(userId) {
    return PersonalChatRoom.findAll({
      raw: true,
      where: {
        [Op.or]: {
          recipient1: userId,
          recipient2: userId,
        },
      },
    }).then((chatrooms) => {
      let userNameMap = new Map();
      let userIds = [];
      for (var i = 0; i < chatrooms.length; i++) {
        let ct = chatrooms[i];
        let uid = ct.recipient1 == userId ? ct.recipient2 : ct.recipient1;
        userIds.push(uid);
      }
      if (userIds.length != 0) {
        return User.findAll({
          raw: true,
          attributes: ["id", "first_name", "last_name", "avatar", "intro"],
          where: {
            id: userIds,
          },
        }).then((users) => {
          for (var i = 0; i < users.length; i++) {
            let user = users[i];
            userNameMap.set(user.id, {
              name: user.first_name + " " + user.last_name,
              avatar: user.avatar,
              intro: user.intro,
            });
          }

          let userChatRooms = [];
          for (var i = 0; i < chatrooms.length; i++) {
            let ct = chatrooms[i];
            let targetId =
              ct.recipient1 == userId ? ct.recipient2 : ct.recipient1;
            let userinfo = userNameMap.get(targetId);
            userChatRooms.push({
              conversationId: ct.id,
              targetId: targetId,
              targetName: userinfo.name,
              targetDescription: userinfo.intro,
              listingId: ct.listing_id,
              messages: ct.messages,
              img: userinfo.avatar,
            });
          }
          return userChatRooms;
        });
      }

      return [];
    });
  }

  getUserGroupChatRooms(userId) {
    return GroupMembers.findAll({
      raw: true,
      attributes: [
        "group_id",
        [Sequelize.col("tenant_group.name"), "name"],
        [Sequelize.col("tenant_group.description"), "description"],
      ],
      where: {
        user_id: userId,
        state: [GroupMemberState.OWNER.id, GroupMemberState.APPROVED.id],
      },
      include: {
        model: TenantGroups,
        attributes: [],
      },
    }).then((groups) => {
      let groupNameMap = new Map();
      let groupIds = [];
      for (var i = 0; i < groups.length; i++) {
        let g = groups[i];
        groupIds.push(g.group_id);
        groupNameMap.set(g.group_id, [g.name, g.description]);
      }
      return GroupMembers.findAll({
        raw: true,
        attributes: [
          "group_id",
          "user_id",
          [Sequelize.col("user.first_name"), "firstname"],
          [Sequelize.col("user.last_name"), "lastname"],
          [Sequelize.col("user.avatar"), "avatar"],
        ],
        where: {
          group_id: groupIds,
          state: [GroupMemberState.OWNER.id, GroupMemberState.APPROVED.id],
        },
        include: {
          model: User,
          attributes: [],
        },
      }).then((members) => {
        let memberMap = new Map();
        for (var i = 0; i < members.length; i++) {
          let m = members[i];
          let gid = m.group_id;
          if (memberMap.has(gid)) {
            memberMap.get(gid).push({
              id: m.user_id,
              name: m.firstname + " " + m.lastname,
              avatar: m.avatar,
            });
          } else {
            memberMap.set(gid, [
              {
                id: m.user_id,
                name: m.firstname + " " + m.lastname,
                avatar: m.avatar,
              },
            ]);
          }
        }

        return GroupChatRoom.findAll({
          raw: true,
          where: {
            group_id: groupIds,
          },
        }).then((groupChatRooms) => {
          let userGroupChatRooms = [];
          for (var i = 0; i < groupChatRooms.length; i++) {
            let ct = groupChatRooms[i];
            userGroupChatRooms.push({
              conversationId: ct.id,
              targetId: ct.group_id,
              targetName: groupNameMap.get(ct.group_id)[0], // [0] = name
              targetDescription: groupNameMap.get(ct.group_id)[1], // [1] = description
              messages: ct.messages,
              img: "/",
              recipients: memberMap.get(ct.group_id),
            });
          }
          return userGroupChatRooms;
        });
      });
    });
  }

  getChatRoom(userId, chatRoomId) {
    return PersonalChatRoom.findByPk(chatRoomId).then((personalChat) => {
      if (!personalChat) {
        // group chat
        return GroupChatRoom.findByPk(chatRoomId, {
          raw: true,
          attributes: [
            "group_id",
            "messages",
            [Sequelize.col("tenant_group.name"), "name"],
            [Sequelize.col("tenant_group.description"), "description"],
          ],
          include: {
            model: TenantGroups,
            attributes: [],
          },
        })
          .then((groupChat) => {
            if (!groupChat) {
              return undefined;
            }
            return GroupMembers.findAll({
              raw: true,
              attributes: [
                "user_id",
                [Sequelize.col("user.first_name"), "firstname"],
                [Sequelize.col("user.last_name"), "lastname"],
                [Sequelize.col("user.avatar"), "avatar"],
              ],
              where: {
                group_id: groupChat.group_id,
                state: [
                  GroupMemberState.OWNER.id,
                  GroupMemberState.APPROVED.id,
                ],
              },
              include: {
                model: User,
                attributes: [],
              },
            }).then((members) => {
              let recipients = [];
              for (var i = 0; i < members.length; i++) {
                let m = members[i];
                recipients.push({
                  id: m.user_id,
                  name: m.firstname + " " + m.lastname,
                  avatar: m.avatar,
                });
              }
              return {
                targetId: groupChat.group_id,
                targetName: groupChat.name,
                targetDescription: groupChat.description,
                img: "/",
                messages: groupChat.messages,
                recipients: recipients,
                isGropuChat: true,
              };
            });
          })
          .catch((err) => {
            console.log(err);
            return undefined;
          });
      }

      let targetId =
        personalChat.recipient1 == userId
          ? personalChat.recipient2
          : personalChat.recipient1;
      return User.findByPk(targetId).then((user) => {
        return {
          targetId: targetId,
          targetName: user.frst_name + " " + user.last_name,
          targetDescription: user.intro,
          img: user.avatar,
          messages: personalChat.messages,
          isGropuChat: false,
        };
      });
    });
  }

  putMessage(chatRoomId, message) {
    return GroupChatRoom.findByPk(chatRoomId).then((groupRoom) => {
      if (groupRoom) {
        // is chat room
        return GroupChatRoom.update(
          {
            messages: Sequelize.fn(
              "array_append",
              Sequelize.col("messages"),
              JSON.stringify(message)
            ),
          },
          { where: { id: chatRoomId } }
        )
          .then(() => {
            return true;
          })
          .catch((err) => {
            console.log(err);
            return false;
          });
      } else {
        return PersonalChatRoom.update(
          {
            messages: Sequelize.fn(
              "array_append",
              Sequelize.col("messages"),
              JSON.stringify(message)
            ),
          },
          { where: { id: chatRoomId } }
        )
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
}

module.exports = new ChatRoomService();
