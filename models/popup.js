'use strict'
const codes = require('../configs/codes')
module.exports = (sequelize, DataTypes) => {
	const popup = sequelize.define('popup', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: DataTypes.STRING
		},
		popupImage: {
			type: DataTypes.STRING
		},
		startDate: {
			type: DataTypes.DATE
		},
		endDate: {
			type: DataTypes.DATE
		},
		linkType: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		linkTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('linkType') !== null) {
					return codes.popupLinkType[this.getDataValue('linkType')]
				} else {
					return null
				}
			}
		},
		linkId: {
			type: DataTypes.STRING
		},
		isOpen: {
			type: DataTypes.BOOLEAN,
			allowNull: false
		}
	}, {
		timestamps: true,
		underscored: true,
		paranoid: true
	})

	popup.search = async (params, models) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		let result = await popup.findAll({
			where: where,
			order: order
		})
		return result
	}

	return popup
}
