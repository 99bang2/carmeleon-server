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
		user.belongsToMany(models.complex, {
			through: models.userComplex
		})
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
	return user
}
