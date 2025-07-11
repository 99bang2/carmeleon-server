'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
    const pointLog = sequelize.define('pointLog', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        point: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        codeId: {
            type: DataTypes.INTEGER,
        },
        reason: {
            type: DataTypes.STRING
        }
    }, {
        indexes: [
            {
                fields: ['created_at']
            }
        ],
        timestamps: true,
        paranoid: true,
        underscored: true
    })
	pointLog.associate = function (models) {
		pointLog.belongsTo(models.user)
    }
	pointLog.getByUid = async function (ctx, uid) {
        let data = await pointLog.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }
	pointLog.getByUserUid = async function (ctx, uid, params) {
		let data = await pointLog.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
			where: {userUid:uid}
		})
		let sum = await pointLog.sum('point', {
			where: {userUid:uid}
		})
		if (!data && !sum) {
			response.badRequest(ctx)
		}
		return {
			row: data,
			sum: sum
		}
	}
	pointLog.search = async (params) => {
        let where = {}
        let result = await pointLog.findAll({
			offset: params.offset ? Number(params.offset) : null,
			limit: params.limit ? Number(params.limit) : null,
            where: where
        })
        return result
    }
    return pointLog
}
