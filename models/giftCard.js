'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
    const giftCard = sequelize.define('giftCard', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        accountUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        publisher: {
            type: DataTypes.STRING
        },
		usedAt: {
			type: DataTypes.DATE
		},
		givenAt: {
			type: DataTypes.DATE
		}
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })

    return giftCard
}
