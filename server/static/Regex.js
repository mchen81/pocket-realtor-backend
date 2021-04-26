const REGEX ={
  EMAIL : /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  
  // between 6 to 20 characters and contain at least one numeric digit, one uppercase and one lowercase letter
  PASSWORD1 : /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/,

  // between 7 to 16 characters and contain only characters, numeric digits, underscore and first character must be a letter
  PASSWORD2 : /^[A-Za-z]\w{7,14}$/

}

module.exports = REGEX;