'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		phone: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				is: {
					args: /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g,
					msg: '올바른 휴대전화번호를 입력하세요.'
				}
			}
		},
		name: {
			type: DataTypes.STRING
		},
		ak: {
			type: DataTypes.STRING
		},
		memo: {
			type: DataTypes.TEXT
		},
	}, {
		indexes: [
			{
				fields: ['created_at', 'ak', 'phone']
			}
		],
		timestamps: true,
		underscored: true
	})

	user.associate = function (models) {
		user.hasMany(models.userComplex)
	}

	user.getByUid = async function (ctx, uid) {
		let data = await user.findByPk(uid )
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	user.getByPhone = async function (ctx, phone) {
		let data = await user.findOne({
			where: {
				phone: phone
			}
		})
		return data
	}

	user.getByAk = async function (ak) {
		let data = await user.findOne({
			where: {
				ak: ak
			}
		})
		return data
	}

	user.search = async (params) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let result = await user.findAll({
			order: order,
			where: where
		})
		return result
	}
	user.search = async (params) => {
		let where = {}
		if (params.searchKeyword) {
			where[Sequelize.Op.or] = [
				{
					name: {
						[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					}
				},
				{
					phone: {
						[Sequelize.Op.like]: '%' + params.searchKeyword + '%'
					}
				}
			]
		}
		let order = [['createdAt', 'DESC']]
		if(params.order && params.orderDir) {
			order = [[params.order, params.orderDir]]
		}
		let result = await user.findAll({
			order: order,
			where: where
		})
		let count = await user.count({
			where: where,
		})
		return {
			rows: result,
			count: count
		}
	}


	return user
}
