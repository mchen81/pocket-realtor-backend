const ResponseTempate = {
  SUCCESS: { code: 10000, msg: "Request Success" },

  // user fails
  EMAIL_EXIST: { code: 40001, msg: "The email has existed" },
  NO_DATA: { code: 40002, msg: "No data found" },
  NO_LOGIN: { code: 40003, msg: "No Login" },
  FORBIDDEN: { code: 40004, msg: "Forbidden" },
  USER_NOT_EXIST: { code: 40005, msg: "User does not exist" },


  INCORRECT_PASSWORD: { code: 40006, msg: "Password is invalid" },
  INVALID_EMAIL: { code: 40007, msg: "Email is invalid" },
  MISS_FIELD: { code: 40008, msg: "Missing Required Fields" },
  INVALID_PASSWORD: { code: 40009, msg: "Password must be between 6 to 20 characters and contain at least one numeric digit, one uppercase and one lowercase letter" },

  INVALID_ZIP_CODE: { code: 40010, msg: "The zip code is invalid" },
  INVALID_INPUT : {code: 40010, msg: "The input body is invalid"},
  // database fails
  FAIL: { code: 50001, msg: "Request Fail" },
  DATABASE_ERROR: { code: 50002, msg: "Some issues happends in database" },

  // token fails
  TOKEN_MISS: { code: 60001, msg: "Token is not found, please login again" },
  TOKEN_ERR: { code: 60002, msg: "Invalid token" },

  // Role fail
  PERMISSION_DENY: {code: 41000, msg: "You are not allowed to do this"}
  
};

module.exports = ResponseTempate;


