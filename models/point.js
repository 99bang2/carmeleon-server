'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const response = require('../libs/response')

module.exports = (sequelize, DataTypes) => {
    const point = sequelize.define('point', {
        uid: {
            type: DataTypes.INT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userUid: {
            type: DataTypes.INT,
            allowNull: false,
        },
        point: {
            type: DataTypes.INT,
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
    point.associate = function (models) {
        point.belongsTo(models.user)
    }
    point.getByUid = async function (ctx, uid) {
        let data = await point.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }

    point.search = async (params) => {
        let where = {}
        let result = await point.findAll({
            where: where
        })
        return result
    }
    return point
}
