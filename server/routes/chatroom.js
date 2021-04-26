var express = require("express");
var router = express.Router();

const ChatRoom = require("../controllers/chatRoomController");
const User = require("../controllers/userController");
const Tenant = require("../controllers/tenantController");

router.get(
  "/conversation/find/",
  User.verifyToken,
  Tenant.verifyTenantRole,
  ChatRoom.findPersonalChatroom
);

router.get("/conversation/all", User.verifyToken, ChatRoom.getUserAllChatrooms);

router.get(
  "/conversation/get/:conversationId",
  User.verifyToken,
  ChatRoom.getOneChatRoom
);
module.exports = router;
