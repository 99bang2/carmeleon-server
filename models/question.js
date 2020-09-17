'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
    const question = sequelize.define('question', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
		name: {
			type: DataTypes.STRING
		},
        email: {
            type: DataTypes.STRING
        },
		category: {
			type: DataTypes.INTEGER
		},
		categoryName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('category') !== null) {
					return codes.questionCategory[this.getDataValue('category')]
				}
			}
		},
        title: {
            type: DataTypes.STRING
        },
		content: {
			type: DataTypes.TEXT
		}
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })
	question.getByUid = async function (ctx, uid, models) {
        let data = await question.findByPk(uid)
        if(!data) response.badRequest(ctx)
        return data
    }

	question.search = async (params, models) => {
        let where = {}
        let result = await question.findAll({
            where:where,
        })
        return result
    }
    return question
}
