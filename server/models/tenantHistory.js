module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "tenant_history",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      type: {
        // 1 viewing house, 2 viewing others
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      viewed_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      viewed_name: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      viewed_time: {
        type: DataTypes.BIGINT,
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
    }
  );
};
