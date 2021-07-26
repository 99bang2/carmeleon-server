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
		},
        userUid: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })

    giftCard.associate = function (models) {
        giftCard.belongsTo(models.user)
    }

    return giftCard
}
