module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "us_zip_codes",
    {
      zip: {
        type: DataTypes.STRING(5),
        primaryKey: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: false,
      },
      county: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
