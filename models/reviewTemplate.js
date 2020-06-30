'use strict'
const response = require('../libs/response')
module.exports = (sequelize, DataTypes) => {
    const reviewTemplate = sequelize.define('reviewTemplate', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        review: {
            type: DataTypes.STRING
        },
        reviewType: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })
    reviewTemplate.getByUid = async function (ctx, uid, models) {
        let data = await reviewTemplate.findByPk(uid)
        if(!data) response.badRequest(ctx)
        return data
    }

    reviewTemplate.search = async (params, models) => {
        let where = {}
        let result = await reviewTemplate.findAll({
            where:where,
        })
        return result
    }
    return reviewTemplate
}