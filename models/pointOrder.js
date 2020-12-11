'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes')
module.exports = (sequelize, DataTypes) => {
    const pointOrder = sequelize.define('pointOrder', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userUid: {
            type: DataTypes.INTEGER
        },
        pointProductUid: {
            type: DataTypes.INTEGER
        },
        category: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        price: {
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING
        },
        statusName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('status') !== null) {
                    return codes.pointOrderStatus[this.getDataValue('status')]
                } else {
                    return null
                }
            }
        },
        memo: {
            type: DataTypes.TEXT
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })

    pointOrder.search = async (params, models) => {
        let where = {}
        let result = await pointOrder.findAll({
            where:where,
        })
        return result
    }

    return pointOrder
}