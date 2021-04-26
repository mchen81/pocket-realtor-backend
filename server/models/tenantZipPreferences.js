module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "tenant_preferences",
    {},
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
