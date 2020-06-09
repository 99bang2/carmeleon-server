'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const admin = sequelize.define('admin', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		id: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.STRING
		},
		name: {
			type: DataTypes.STRING
		},
		grade: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true
	})
	admin.getByUid = async function (ctx, uid) {
		let data = await admin.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	admin.search = async (params) => {
		let where = {}
		let result = await admin.findAll({
			where: where
		})
		return result
	}
	return admin
}
