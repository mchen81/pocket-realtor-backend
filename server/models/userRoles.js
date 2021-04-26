module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "user_roles",
    {},
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
