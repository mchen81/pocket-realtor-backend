module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "listing_applications",
    {
      // listing id
      // group id
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      state:{
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
};
