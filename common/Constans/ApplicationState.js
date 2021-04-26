const ApplicationState = {
  NA: {id: 0, description: "No application yet, typically for listings in groups"},
  PENDING: { id: 1, description: "Listing owner has not read the application"},
  SCHEDULING: { id: 2, description: "Listing owner and applier are scheduling to meet"},
  REJECT: {id:3, description: "Listing owner has rejected the application"}
};

module.exports = ApplicationState;
