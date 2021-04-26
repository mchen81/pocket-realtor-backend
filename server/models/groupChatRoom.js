module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "group_chat_rooms",
    {
      id : { 
        type: DataTypes.UUID,
        primaryKey: true,
      },
      messages:{
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: true,
      }
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
};
