module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "group_members",
    {
      state : { // value is an id in common/Constants/GroupMemberState.js 
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
