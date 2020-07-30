'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
module.exports = (sequelize, DataTypes) => {
	const discountTicket = sequelize.define('discountTicket', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		siteUid:{
			type: DataTypes.INTEGER,
		},
		ticketTitle: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('ticketType') !== null && this.getDataValue('ticketDayType') !== null) {
					let ticketTitle = codes.ticketTypeOpts[this.getDataValue('ticketType')] +
						'(' + codes.ticketDayTypeOpts[this.getDataValue('ticketDayType')] + ')'
					if(this.getDataValue('ticketType') === 1 && this.getDataValue('ticketTime')){
						ticketTitle = this.getDataValue('ticketTime') + ticketTitle
					}
					return ticketTitle
				}
			}
		},
		ticketType: {
			type: DataTypes.INTEGER,
		},
		ticketTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('ticketType') !== null) {
					return codes.ticketTypeOpts[this.getDataValue('ticketType')]
				}
			}
		},
		ticketTime: {
			type: DataTypes.INTEGER,
		},
		ticketDayType: {
			type: DataTypes.INTEGER,
		},
		ticketDayTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('ticketDayType') !== null) {
					return codes.ticketDayTypeOpts[this.getDataValue('ticketDayType')]
				}
			}
		},
		ticketPrice: {
			type: DataTypes.INTEGER,
		},
		ticketPriceDiscount: {
			type: DataTypes.INTEGER,
		},
		ticketPriceDiscountPercent: {
			type: DataTypes.INTEGER,
		},
		isActive: {
			type: DataTypes.BOOLEAN,
			defaultValue: true
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	discountTicket.associate = function (models) {
		discountTicket.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
	}
	discountTicket.getByUid = async function (ctx, uid) {
		let data = await discountTicket.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	discountTicket.search = async (params) => {
		let where = {}
		if(params.siteUid){
			where.siteUid = params.siteUid
		}
		let result = await discountTicket.findAll({
			where: where
		})
		return result
	}
	return discountTicket
}
