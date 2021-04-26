module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "tenant_groups",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      notes : {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      }
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
