module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "role_permissions",
    {},
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
