var express = require("express");
var router = express.Router();

const User = require("../controllers/userController");

/* GET users listing. */
// router.get('/user', function(req, res, next) {
//   res.send('Usually this is not available');
// });

router.get("/user/:userId", User.getUserProfile);
router.get("/user/role/:userId/", User.getUserRole);

router.post("/user/register", User.register);
router.post("/user/login", User.login);

router.post("/user/verifyuser", User.verifyToken, User.testUserToken);

router.post("/user/updatePassword", User.verifyToken, User.updatePassword);
router.put("/user/updateProfile", User.verifyToken, User.updateProfile);
router.put("/user/updateRole", User.verifyToken, User.updateRole);
router.put("/user/updateAvatar", User.verifyToken, User.updateAvatar);

router.delete("/history/tenant", User.verifyToken, User.cleanTenantHistory);
router.delete("/history/listing", User.verifyToken, User.cleanListingHistory);


module.exports = router;
