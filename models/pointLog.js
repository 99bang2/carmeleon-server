'use strict'
const Promise = require('bluebird')
const response = require('../libs/response')

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
	pointLog.getByUserUid = async function (ctx, uid) {
		let data = await pointLog.findAll({
			where: {userUid:uid}
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	pointLog.search = async (params) => {
        let where = {}
        let result = await pointLog.findAll({
            where: where
        })
        return result
    }
    return pointLog
}
