module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "personal_chat_rooms",
    {
      //recipient1
      //recipient2
      id : { 
        type: DataTypes.UUID,
        primaryKey: true,
      },
      recipient1:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient2:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      listing_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
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
      indexes: [
        {
            unique: true,
            fields: ['recipient1', 'recipient2']
        }
    ]
    }
  );
};
