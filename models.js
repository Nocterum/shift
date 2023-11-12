const sequelize = require('./db');
const { DataTypes } = require('sequelize');

const UserModel = sequelize.define( 'driver', {
    id: {type: DataTypes.SMALLINT, primaryKey: true, unique: true, autoIncrement: true},
    chatId: {type: DataTypes.BIGINT, unique:true},
    city: {type: DataTypes.TEXT('tiny')},
    subdivision: {type: DataTypes.TEXT('tiny')},
    userName: {type: DataTypes.TEXT('tiny')},
    lastCommand: {type: DataTypes.TEXT('medium')},
    fromToSend: {type: DataTypes.TEXT('tiny')},
    whereToSend: {type: DataTypes.TEXT('tiny')},
    toWhomToSend: {type: DataTypes.TEXT('tiny')},
    whatToSend: {type: DataTypes.TEXT('medium')},
    moveId: {type: DataTypes.TEXT('tiny')}
})

const MoveModel = sequelize.define( 'movement', {
    id: {type: DataTypes.MEDIUMINT, primaryKey: true, unique: true, autoIncrement: true},
    moveId: {type: DataTypes.TEXT('tiny')},
    fromToSend: {type: DataTypes.TEXT('tiny')},
    whereToSend: {type: DataTypes.TEXT('tiny')},
    toWhomToSend: {type: DataTypes.TEXT('tiny')},
    whatToSend: {type: DataTypes.TEXT('medium')},
    whoSend: {type: DataTypes.TEXT('tiny')},
    whoDriver: {type: DataTypes.TEXT('tiny')},
    delivered: {type: DataTypes.TEXT('tiny')},
    comment: {type: DataTypes.TEXT('tiny')},
})

module.exports = { UserModel , MoveModel };