'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const notice = sequelize.define('notice', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING
		},
		content: {
			type: DataTypes.STRING
		},
		adminUid: {
			type: DataTypes.INTEGER
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	notice.associate = function (models) {
		notice.belongsTo(models.admin)
	}
	notice.getByUid = async function (ctx, uid) {
		let data = await notice.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	notice.search = async (params) => {
		let where = {}
		let result = await notice.findAll({
			where: where
		})
		return result
	}
	return notice
}
