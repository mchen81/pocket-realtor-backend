module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "listings",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(2),
        allowNull: true,
      },
      zip_code: {
        type: DataTypes.INTEGER(5),
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
      sale_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rent_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      area: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      rooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bath_rooms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      image_links: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
};
