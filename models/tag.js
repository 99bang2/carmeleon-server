'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
	const tag = sequelize.define('tag', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		complexUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
	}, {
		indexes: [
			{
				name: 'tags_indexes',
				fields: ['created_at']
			}
		],
		timestamps: true,
		paranoid: false,
		underscored: true,
	})

	tag.associate = function (models) {
		tag.belongsTo(models.complex)
		tag.belongsToMany(models.door, {
			through: models.doorTag
		})
	}

	tag.getByUid = async function (ctx, uid) {
		let data = await tag.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	tag.search = async (params, models) => {
		let where = {}
		if(params.complexUid) {
			where.complexUid = params.complexUid
		}
		let order = [['name', 'ASC']]
		let result = await tag.findAll({
			order: order,
			where: where,
			include:[{
				model: models.complex,
				paranoid: false,
			},{
				model: models.door
			}]
		})
		return result
	}

	return tag
}
