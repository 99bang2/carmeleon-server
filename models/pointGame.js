'use strict'
module.exports = (sequelize, DataTypes) => {
    const pointGame = sequelize.define('pointGame', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        point: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        probability: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        timestamps: true,
        underscored: true
    })
    return pointGame
}
