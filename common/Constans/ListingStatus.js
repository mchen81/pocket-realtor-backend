const ListingStatus = {
  AVAILABLE: { id: 1, description: "This listing is available for everyone to apply"},
  SCHEDULED: { id: 2, description: "This listing is applied by someone and the owner has approved it"},
  HIDEN: { id: 3, description: "This listing is currently not available"},
  SOLD: { id: 4, description: "This listing is purchased/rented by someone"},
};

module.exports = ListingStatus;
