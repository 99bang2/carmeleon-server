'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
	const complex = sequelize.define('complex', {
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
		complexType: {
			type: DataTypes.STRING
		},
		complexTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('complexType') !== null) {
					return codes.complexType[this.getDataValue('complexType')]
				}
			}
		},
		addressCode: {
			type: DataTypes.INTEGER
		},
		addressCodeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('addressCode') !== null) {
					return codes.addressCode[this.getDataValue('addressCode')].name
				}
			}
		},
		addressDetailCode: {
			type: DataTypes.INTEGER
		},
		addressDetailCodeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('addressCode') !== null && this.getDataValue('addressDetailCode') !== null) {
					return codes.addressCode[this.getDataValue('addressCode')].details[this.getDataValue('addressDetailCode')].name
				}
			}
		},
		fullAddress: {
			type: DataTypes.STRING
		},
		memo: {
			type: DataTypes.TEXT
		},
	}, {
		indexes: [
			{
				name: 'complexs_indexes',
				fields: ['created_at']
			}
		],
		timestamps: true,
		paranoid: true,
		underscored: true,
	})

	complex.associate = function (models) {
		complex.hasOne(models.admin)
		complex.hasMany(models.tag)
		complex.hasMany(models.door)
		complex.belongsToMany(models.user, {
			through: models.userComplex
		})
	}

	complex.getByUid = async function (ctx, uid, models) {
		let data = await complex.findByPk(uid, {
			include: [{
				model: models.admin
			},{
				model: models.tag
			},{
				model: models.door
			}]
		})
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	complex.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'ASC']]
		if(params.complexType) {
			where.complexType = params.complexType
		}
		if(params.addressCode) {
			where.addressCode = params.addressCode
		}
		if(params.addressDetailCode) {
			where.addressDetailCode = params.addressDetailCode
		}
		let result = await complex.findAll({
			order: order,
			where: where,
			include: [{
				model: models.admin
			},{
				model: models.tag
			},{
				model: models.door
			}]
		})
		return result
	}

	return complex
}
