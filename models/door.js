'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
	const door = sequelize.define('door', {
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
		bleName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		complexUid: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		macAddress: {
			type: DataTypes.STRING
		},
		serviceUuid: {
			type: DataTypes.STRING
		},
		txNotiChar: {
			type: DataTypes.STRING
		},
		rxWrtieChar: {
			type: DataTypes.STRING
		},
		keyOpenDoor: {
			type: DataTypes.STRING
		},
		rssiOpen: {
			type: DataTypes.INTEGER,
			allowNull: true,
			defaultValue: -50,
		},
		memo: {
			type: DataTypes.TEXT
		},
	}, {
		indexes: [
			{
				name: 'doors_indexes',
				fields: ['created_at']
			}
		],
		timestamps: true,
		paranoid: false,
		underscored: true,
	})

	door.associate = function (models) {
		door.belongsTo(models.complex)
		door.belongsToMany(models.tag, {
			through: models.doorTag
		})
	}

	door.getByUid = async function (ctx, uid) {
		let data = await door.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	door.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'ASC']]
		if(params.uids && params.uids.length > 0) {
			where.uid = {
				[Sequelize.Op.in]: params.uids
			}
			order = [['complexUid', 'ASC'], ['name', 'ASC']]
		}
		if(params.complexUid) {
			where.complexUid = params.complexUid
		}
		let result = await door.findAll({
			order: order,
			where: where,
			include:[{
				model: models.complex,
				paranoid: false
			},{
				model: models.tag
			}]
		})
		return result
	}

	return door
}
