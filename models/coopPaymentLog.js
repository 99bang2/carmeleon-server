'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const coopCode = require('../configs/coop.json')

module.exports = (sequelize, DataTypes) => {
    const coopLog = sequelize.define('coopPaymentLog', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userUid: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        payLogUid: {
            type: DataTypes.INTEGER
        },
        usageType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        usageTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                let type = this.getDataValue('usageType')
                return coopCode.usageType[type]
            }
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        brandAuthCode: {
            type: DataTypes.STRING
        },
        couponNumber: {
            type: DataTypes.STRING
        }
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })

    coopLog.associate = function (models) {
        coopLog.belongsTo(models.user)
        coopLog.belongsTo(models.payLog)
    }

    coopLog.getCoopHistory = async function (ctx, models) {
        return coopLog.findAll({
            attributes: ['createdAt', 'payLogUid', 'price', 'uid', 'usageType'],
            include: {
                model: models.payLog,
                attributes: ['discountTicketUid', 'siteUid'],
                include: [
                    {
                        model: models.parkingSite,
                        attributes: ['name']
                    },
                    {
                        model: models.discountTicket,
                        attributes: ['ticketTitle', 'ticketDayType', 'ticketDayTypeName', 'ticketType', 'ticketTypeName'],
                        paranoid: false
                    }
                ]
            },
            where:{
                userUid: ctx.user.uid
            }
        })

    }

    return coopLog
}
