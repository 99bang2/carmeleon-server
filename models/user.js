'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const response = require('../libs/response')

module.exports = (sequelize, DataTypes) => {
    const user = sequelize.define('user', {
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
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING
        },
        mobile: {
            type: DataTypes.STRING
        },
        point: {
            type: DataTypes.INTEGER
        },
		push: {
        	type: DataTypes.BOOLEAN
		},
		marketing: {
			type: DataTypes.BOOLEAN
		},
        memo: {
            type: DataTypes.TEXT
        }
        /* 토큰 관련 컬럼 추가 예정*/
    }, {
        indexes: [
            {
                fields: ['created_at']
            }
        ],
        timestamps: true,
        paranoid: true,
        underscored: true,
        hooks: {
            beforeCreate: function (user, options) {
                return bcrypt.genSaltAsync(5).then(function (salt) {
                    return bcrypt.hashAsync(user.password, salt, null)
                }).then(function (hash) {
                    user.password = hash
                }).catch(function (err) {
                    return sequelize.Promise.reject(err)
                })
            },
            beforeUpdate: function (user, options) {
                if (user.password) {
                    return bcrypt.genSaltAsync(5).then(function (salt) {
                        return bcrypt.hashAsync(user.password, salt, null)
                    }).then(function (hash) {
                        user.password = hash
                    }).catch(function (err) {
                        return sequelize.Promise.reject(err)
                    })
                } else {
                    return true
                }
            }
        }
    })

	user.applyScope = function (models) {
		user.addScope('defaultScope', {
			attributes: { exclude: ['password'] },
		})
		user.addScope('login', {
			attributes: ['uid', 'id', 'password', 'name', 'grade', 'freePassTicketCount', 'passTicketCount'],
		})
	}

	user.prototype.verifyPassword = function (password) {
		return bcrypt.compareAsync(password, this.password)
	}

	user.getByUid = async function (ctx, uid) {
		let data = await user.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	user.getById = async function (ctx, id) {
		let data = await user.scope('login').findOne({
			where: {
				id: id
			}
		})
		return data
	}

    user.search = async (params) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		if(params.grade) {
			where.grade = params.grade
		}
		let result = await user.findAll({
			order: order,
			where: where
		})
		return result
    }

    return user
}
