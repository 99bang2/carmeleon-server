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
		noticeType:{
			type: DataTypes.INTEGER,
		},
		isOpen: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		accountUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	notice.associate = function (models) {
		notice.belongsTo(models.account)
	}
	notice.getByUid = async function (ctx, uid, models) {
		let data = await notice.findByPk(uid, {
			include: [{
				model: models.account
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	notice.search = async (params, models) => {
		let where = {}
		let result = await notice.findAll({
			where: where,
			include: [{
				model: models.account
			}]
		})
		return result
	}
	notice.userSearch = async (params, models) => {
		let where = {}
		where.isOpen = 1
		let order = [ ['noticeType', 'ASC'], ['createdAt', 'DESC']]
		let result = await notice.findAll({
			include: [{
				model: models.account
			}],
			where: where,
			order: order
		})
		return result
	}
	return notice
}
