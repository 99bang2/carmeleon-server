'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const response = require('../libs/response')
const codes = require('../configs/codes.json')

module.exports = (sequelize, DataTypes) => {
    const admin = sequelize.define('admin', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        complexUid: {
            type: DataTypes.INTEGER,
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
        phone: {
            type: DataTypes.STRING
        },
        grade: {
            type: DataTypes.STRING
        },
        gradeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('grade') !== null) {
                    return codes.adminGrade[this.getDataValue('grade')]
                }
            }
        },
        memo: {
            type: DataTypes.TEXT
        },
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
            beforeCreate: function (admin, options) {
                return bcrypt.genSaltAsync(5).then(function (salt) {
                    return bcrypt.hashAsync(admin.password, salt, null)
                }).then(function (hash) {
                    admin.password = hash
                }).catch(function (err) {
                    return sequelize.Promise.reject(err)
                })
            },
            beforeUpdate: function (admin, options) {
                if (admin.password) {
                    return bcrypt.genSaltAsync(5).then(function (salt) {
                        return bcrypt.hashAsync(admin.password, salt, null)
                    }).then(function (hash) {
                        admin.password = hash
                    }).catch(function (err) {
                        return sequelize.Promise.reject(err)
                    })
                } else {
                    return true
                }
            }
        }
    })

    admin.associate = function (models) {
        admin.belongsTo(models.complex)
    }

    admin.applyScope = function (models) {
        admin.addScope('defaultScope', {
            attributes: {exclude: ['password']},
        })
        admin.addScope('login', {
            attributes: ['uid', 'id', 'password', 'name', 'grade', 'complexUid'],
        })
    }

    admin.prototype.verifyPassword = function (password) {
        return bcrypt.compareAsync(password, this.password)
    }

    admin.getByUid = async function (ctx, uid) {
        let data = await admin.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }

    admin.getById = async function (id) {
        let data = await admin.scope('login').findOne({
            where: {
                id: id
            }
        })
        return data
    }

    admin.search = async (params) => {
        let where = {}
        let order = [['createdAt', 'DESC']]
        if (params.grade) {
            where.grade = params.grade
        }
        let result = await admin.findAll({
            order: order,
            where: where
        })
        return result
    }
    return admin
}
