'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes')
module.exports = (sequelize, DataTypes) => {
    const pointProduct = sequelize.define('pointProduct', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        productType: {
            type: DataTypes.INTEGER
        },
        productTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('productType') !== null) {
                    return codes.pointProductType[this.getDataValue('productType')]
                } else {
                    return null
                }
            }
        },
        category: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING
        },
        listImage: {
            type: DataTypes.STRING
        },
        detailImage: {
            type: DataTypes.STRING
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isSoldOut: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        price: {
            type: DataTypes.INTEGER
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