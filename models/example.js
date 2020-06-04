'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const example = sequelize.define('example', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING
		}
	}, {
		timestamps: true,
		underscored: true
	})
	example.getByUid = async function (ctx, uid) {
		let data = await example.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	example.search = async (params) => {
		let where = {}
		let result = await example.findAll({
			where: where
		})
		return result
	}
	return example
}
