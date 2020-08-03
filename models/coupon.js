'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
    const coupon = sequelize.define('coupon', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        couponType: {
            type: DataTypes.INTEGER
        },
        couponTitle: {
            type: DataTypes.STRING
        },
        couponContent: {
            type:DataTypes.STRING
        },
		couponPrice: {
			type:DataTypes.STRING
		},
		couponCount: {
			type:DataTypes.INTEGER
		},
		startDate: {
			type: DataTypes.DATE
		},
		endDate: {
			type: DataTypes.DATE
		}
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })
    coupon.getByUid = async function (ctx, uid, models) {
        let data = await coupon.findByPk(uid)
        if(!data) response.badRequest(ctx)
        return data
    }

    coupon.search = async (params, models) => {
        let where = {}
		if (params.userUid){
			where.userUid = params.userUid
		}
		let order = [['createdAt', 'DESC']]
        let result = await coupon.findAll({
			order: order,
            where:where,
        })
        return result
    }
    return coupon
}
