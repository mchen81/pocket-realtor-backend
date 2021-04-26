const resTemplate = require("../static/ResponseTemplate");
const { isUuid } = require("uuidv4");
const ChatRoomService = require("../services/ChatRoomService");
const ListingService = require("../services/ListingService");
class ChatRoomController {
  findPersonalChatroom(req, res) {
    let user = req.body.user;
    let targetId = req.query.hostId;
    let listingId = req.query.listingId;

    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }
    if (!targetId || !listingId) {
      res.status(400).json(resTemplate.MISS_FIELD);
      return;
    }
    ListingService.verifyListingOwner(targetId, listingId).then(
      (isTargetOwner) => {
        if (isTargetOwner) {
          ChatRoomService.findOrCreatePersonalChat(
            user.id,
            targetId,
            listingId
          ).then((chatroomId) => {
            if (chatroomId) {
              res.json(
                Object.assign({}, resTemplate.SUCCESS, {
                  data: {
                    conversationId: chatroomId,
                    targetId: targetId,
                    listingId: listingId,
                  },
                })
              );
            } else {
              res.status(404).json(resTemplate.DATABASE_ERROR);
            }
          });
        } else {
          res.status(403).send(resTemplate.PERMISSION_DENY);
        }
      }
    );
  }

  getUserAllChatrooms(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }
    ChatRoomService.getUserPersonalChatRooms(user.id).then((personalChats) => {
      for (var i = 0; i < personalChats.length; i++) {
        let pc = personalChats[i];
        pc.isGroupChat = false;
      }
      ChatRoomService.getUserGroupChatRooms(user.id).then((groupChats) => {
        for (var i = 0; i < groupChats.length; i++) {
          let gc = groupChats[i];
          gc.isGroupChat = true;
        }
        let result = personalChats.concat(groupChats);
        result.sort((a, b) => {
          let aLastChatTime =
            a.messages.length == 0
              ? "0"
              : a.messages[a.messages.length - 1].date;
          let bLastChatTime =
            b.messages.length == 0
              ? "0"
              : b.messages[b.messages.length - 1].date;

          if (aLastChatTime >= bLastChatTime) {
            return -1;
          } else {
            return 1;
          }
        });
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: result }));
      });
    });
  }

  getOneChatRoom(req, res) {
    let user = req.body.user;
    if (!user) {
      res.status(403).json(resTemplate.TOKEN_ERR);
      return;
    }
    let chatroomId = req.params.conversationId;

    if (!isUuid(chatroomId)) {
      res.status(400).send(chatroomId + " is not a valid UUID");
      return;
    }

    ChatRoomService.getChatRoom(user.id, chatroomId).then((chatroom) => {
      if (chatroom) {
        res.json(Object.assign({}, resTemplate.SUCCESS, { data: chatroom }));
      } else {
        res.status(500).json(resTemplate.DATABASE_ERROR);
      }
    });
  }
}

module.exports = new ChatRoomController();
