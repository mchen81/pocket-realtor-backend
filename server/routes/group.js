var express = require("express");
var router = express.Router();

const Tenant = require("../controllers/tenantController");
const User = require("../controllers/userController");
const TenantGroup = require("../controllers/groupController");

//=======================group operation=====================
router.post(
  "/tenant/group/create",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.createGroup
);

router.put(
  "/tenant/group/update",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.updateGroup
);

router.delete(
  "/tenant/group/delete/:id",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.deleteGroup
);

router.get("/tenant/group/:id", User.interpretToken, TenantGroup.getGroup);

router.post(
  "/tenant/group/invite/",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.inviteTenant
);

router.put(
  "/tenant/group/invite/accept/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.acceptInvitation
);

router.put(
  "/tenant/group/invite/reject/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.rejectInvitation
);

router.post(
  "/tenant/group/apply/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.applyGroup
);

router.put(
  "/tenant/group/apply/respond/",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.respondApplication
);

router.get(
  "/tenant/group/waiting/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.getWaitingTenants
);

router.get(
  "/tenant/group/applied/list",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.getApplyingGroups
);

router.get(
  "/tenant/group/invite/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.getGroupInvitees
);

router.get(
  "/tenant/invitations",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.getInvitations
);

router.delete(
  "/tenant/group/applied/cancel/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.cancelApplication
);

router.put(
  "/tenant/group/notes/put/:groupId",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.putMessage
);

router.get("/tenant/find/groups", TenantGroup.findAllGroup);

router.get(
  "/tenant/groups",
  User.verifyToken,
  Tenant.verifyTenantRole,
  TenantGroup.getUserGroups
);

router.post(
  "/tenant/group/addListing",
  User.verifyToken,
  TenantGroup.addListingToGroup
);

router.put(
  "/tenant/group/approve/listing",
  User.verifyToken,
  TenantGroup.approveListing
);

router.delete(
  "/tenant/group/approve/listing",
  User.verifyToken,
  TenantGroup.withdrawApproment
);

router.get(
  "/tenant/group/listings/approved",
  User.verifyToken,
  TenantGroup.getApprovedMember
);

router.get(
  "/tenant/group/view/listings/:groupId",
  User.verifyToken,
  TenantGroup.getGroupListings
);

router.post(
  "/tenant/group/listings/apply",
  User.verifyToken,
  TenantGroup.groupApplyListing
);

router.put(
  "/tenant/group/listing/application/update",
  User.verifyToken,
  TenantGroup.updateApplicationDescription
);

router.delete(
  "/tenant/group/listing/application/delete",
  User.verifyToken,
  TenantGroup.deleteApplication
);

router.get(
  "/tenant/group/owner/:id",
  TenantGroup.getOwnerGroup
)

module.exports = router;
