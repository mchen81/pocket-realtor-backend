module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "favorite_listings",
    {
      create_time: {
        type: DataTypes.DATE(),
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
