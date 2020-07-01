'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
    const pointProduct = sequelize.define('pointProduct', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        point: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.INTEGER
        },
        addPoint: {
            type:DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })
    pointProduct.getByUid = async function (ctx, uid, models) {
        console.log('uid', uid)
        let data = await pointProduct.findByPk(uid)
        if(!data) response.badRequest(ctx)
        return data
    }

    pointProduct.search = async (params, models) => {
        let where = {}
        let result = await pointProduct.findAll({
            where:where,
        })
        return result
    }
    return pointProduct
}