'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const moment = require('moment')
module.exports = (sequelize, DataTypes) => {
	const discountTicket = sequelize.define('discountTicket', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		siteUid: {
			type: DataTypes.INTEGER,
		},
		ticketTitle: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('ticketType') !== null && this.getDataValue('ticketDayType') !== null) {
					let ticketTitle = codes.ticketTypeOpts[this.getDataValue('ticketType')] +
						'(' + codes.ticketDayTypeOpts[this.getDataValue('ticketDayType')] + ')'
					if (this.getDataValue('ticketType') === 1 && this.getDataValue('ticketTime')) {
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
		},
		ticketStartDate: {
			type: DataTypes.DATE,
		},
		ticketEndDate: {
			type: DataTypes.DATE,
		},
		ticketCount: {
			type: DataTypes.INTEGER,
		},
		//Todo: Macro 컬럼 JSON 추가 (수동 작업 예정)
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})
	discountTicket.associate = function (models) {
		discountTicket.belongsTo(models.parkingSite, {foreignKey: 'siteUid', targetKey: 'uid'})
	}
	discountTicket.getByUid = async function (ctx, uid) {
		let data = await discountTicket.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}
	discountTicket.search = async (params, models) => {
		let currentDate = moment().format('YYYY-MM-DD')
		let currentDay = parseInt(moment().format('E'))
		let dayType
		(currentDay === 0 || currentDay === 6) ? dayType = 2 : dayType = 1
		let where = {}
		if (params.siteUid) {
			where.siteUid = params.siteUid
		}
		if (params.productTag) {
			where.ticketType = params.productTag
		}
		let result = await discountTicket.findAll({
			attributes: {
				include: [
					[sequelize.literal(`case when ('` + currentDate + `' not between ticket_start_date AND ticket_end_date) AND (ticket_day_type !=` + dayType + `) then 1 else 0 end`), 'expire'],
					[sequelize.literal(`case when ((select count(uid) from pay_logs where discount_ticket_uid = uid) = ticket_count) then 1 else 0 end`), 'sold_out']
				]
			},
			where: where
		})
		return result
	}

	return discountTicket
}
