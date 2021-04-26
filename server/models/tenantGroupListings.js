module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "tenant_group_listings",
    {
      // group id
      // added by
      // listing id
      approved_by: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: true,
      },
      state: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
