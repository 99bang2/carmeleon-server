'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
	const account = sequelize.define('account', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				is: {
					args: /^[a-z0-9]{3,20}$/i,
					msg: 'ID는 3~20자의 영문소문자, 숫자만 사용 가능합니다.'
				}
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING
		},
		grade: {
			type: DataTypes.INTEGER
		},
		isActive: {
			type: DataTypes.BOOLEAN
		}
	}, {
		timestamps: true,
		paranoid: true,
		underscored: true,
		hooks: {
			beforeCreate: function (account, options) {
				return bcrypt.genSaltAsync(5).then(function (salt) {
					return bcrypt.hashAsync(account.password, salt, null)
				}).then(function (hash) {
					account.password = hash
				}).catch(function (err) {
					return sequelize.Promise.reject(err)
				})
			},
			beforeUpdate: function (account, options) {
				if (account.password) {
					return bcrypt.genSaltAsync(5).then(function (salt) {
						return bcrypt.hashAsync(account.password, salt, null)
					}).then(function (hash) {
						account.password = hash
					}).catch(function (err) {
						return sequelize.Promise.reject(err)
					})
				} else {
					return true
				}
			}
		}
	})

	account.applyScope = function (models) {
		account.addScope('defaultScope', {
			attributes: {exclude: ['password']},
		})
		account.addScope('login', {
			attributes: ['uid', 'id', 'password', 'name', 'grade'],
		})
	}
	account.prototype.verifyPassword = function (password) {
		return bcrypt.compareAsync(password, this.password)
	}
	account.getByUid = async function (ctx, uid) {
		let data = await account.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	account.getById = async function (id, models) {
		let data = await account.scope('login').findOne({
			where: {
				id: id
			}
		})
		return data
	}
	account.search = async (params) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		if (params.grade) {
			where.grade = params.grade
		}
		let result = await account.findAll({
			order: order,
			where: where
		})
		return result
	}
	return account
}
