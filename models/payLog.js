'use strict'
const response = require('../libs/response')
const codes = require('../configs/codes.json')
const moment = require('moment')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
module.exports = (sequelize, DataTypes) => {
    const payLog = sequelize.define('payLog', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        //// 사용 내역 정보 /////
        payResultUid: {
            type: DataTypes.INTEGER
        },
        // or carModel uid //
        carNumber: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        reserveTime: {
            type: DataTypes.STRING
        },
        payType: {
            type: DataTypes.STRING
        },
        payTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('payType') !== null) {
                    return codes.paymentTag[this.getDataValue('payType')]
                }
            }
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        price: {
            type: DataTypes.INTEGER
        },
        discountPrice: {
            type: DataTypes.INTEGER
        },
        totalPrice: {
            type: DataTypes.INTEGER
        },
        fee: {
            type: DataTypes.INTEGER
        },
        visible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        ///////////////////////
        userUid: {
            type: DataTypes.INTEGER
        },
        siteUid: {
            type: DataTypes.INTEGER
        },
        discountTicketUid: {
            type: DataTypes.INTEGER
        },
        cardUid: {
            type: DataTypes.INTEGER
        },
        rateUid: {
            type: DataTypes.INTEGER
        },
		payOid: {
			type: DataTypes.STRING
		},
		payTid: {
			type: DataTypes.STRING
		},
		activeStatus: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		expired: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		cancelStatus: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		cancelReason: {
        	type: DataTypes.STRING
		},
        clientStatus: {
            type: DataTypes.VIRTUAL,
            get: function () {
                let status = this.getDataValue('status')
                let cancelStatus = this.getDataValue('cancelStatus')
                let expired = this.getDataValue('expired')
                let activeStatus = this.getDataValue('activeStatus')
                if(status === 10 || status === -20) {
                    if(activeStatus) {
                        return 'used'
                    }else {
                        if(expired) {
                            return 'expired'
                        }else {
                            if(cancelStatus === 0) {
                                return 'refunding'
                            }else if(cancelStatus === 10) {
                                return 'refunded'
                            }else {
                                return 'paid'
                            }
                        }
                    }
                }else {
                    return 'none'
                }
            }
        },
    }, {
        timestamps: true,
        underscored: true,
        paranoid: true
    })
    payLog.associate = function (models) {
        payLog.belongsTo(models.user)
		payLog.belongsTo(models.payResult)
        payLog.belongsTo(models.parkingSite, {foreignKey: 'site_uid', targetKey: 'uid'})
        payLog.belongsTo(models.discountTicket)
        payLog.belongsTo(models.card)
    }
    payLog.getByUid = async function (ctx, uid, models) {
        let data = await payLog.findByPk(uid, {
            include: [
                {
                    model: models.parkingSite,
                }, {
                    model: models.discountTicket,
                }, {
                    model: models.card,
                }, {
                    model: models.user,
                },
            ]
        })
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }
    payLog.search = async (params, models) => {
        let where = {}
        let offset = null
        let limit = null
        let order = [['createdAt', 'DESC']]
        if (params.searchData) {
            let searchData = JSON.parse(params.searchData)
            if (searchData.searchKeyword) {
                where = {
                    [Op.or]: [
                        {
                            carNumber: {
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        },
                        {
                            phoneNumber: {
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        },
                        {
                            price: {
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        },
                        {
                            discountPrice: {
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        }
                    ]
                }
            }

            if (searchData.searchDate) {
                if (searchData.searchDate.split('~').length > 1) {
                    where.createdAt = {
                        [Op.between]: [
                            moment(searchData.searchDate.split(' ~ ')[0]).format('YYYY-MM-DD'),
                            moment(searchData.searchDate.split(' ~ ')[1]).add(1, 'days').format('YYYY-MM-DD')
                        ]
                    }
                } else {
                    where.createdAt = {
                        [Op.between]: [
                            moment(searchData.searchDate).format('YYYY-MM-DD'),
                            moment(searchData.searchDate).add(1, 'days').format('YYYY-MM-DD')
                        ]
                    }
                }
            }
        }
        if (params.userUid) {
            where.userUid = params.userUid
        }
        if (params.visible) {
            where.visible = params.visible
        }
        if (params.carNumber) {
            where.carNumber = {[Op.substring]: params.carNumber}
        }
        if (params.page) {
            //offset, limit 처리//
            limit = 10
            offset = (Number(params.page) - 1) * limit
        }
        let rateWhere = 'target_type = 0 AND target_uid = payLog.site_uid AND user_uid = payLog.user_uid)'
        let result = await payLog.findAll({
            //TODO:추후 필요한 사항만 attribute 넣어 놓을 것
            attributes: {
                include: [
                    [`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count'],
                ]
            },
            include: [
				{
					model: models.parkingSite,
					attribute: ['name', 'address', 'lat', 'lon']
				}, {
					model: models.discountTicket,
					attributes: ['siteUid', 'ticketDayType', 'ticketDayTypeName', 'ticketPrice', 'ticketPriceDiscount', 'ticketPriceDiscountPercent', 'ticketTime', 'ticketTitle', 'ticketType', 'ticketTypeName', 'uid']
				}, {
                    model: models.user,
					attributes: ['uid', 'id', 'snsType', 'name', 'nickname', 'email', 'phone', 'profileImage', 'navigationType' ,'marketing']
                },
            ],
            offset: offset,
            limit: limit,
            where: where,
            order: order
        })
        let count = await payLog.count({
            where: where
        })
        return {
            rows: result,
            count: count
        }
    }
    payLog.getByUserUid = async function (ctx, params, models) {
        let where = {
            visible: true,
            status: {
                [Sequelize.Op.in]: [10, -20]
            },
            userUid: ctx.user.uid,
        }
        let offset = null
        let limit = null
        let order = [['createdAt', 'DESC']]
        if (params.page) {
            limit = 10
            offset = (Number(params.page) - 1) * limit
        }
        let result = await payLog.findAll({
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['name', 'address', 'lat', 'lon']
                },{
            		model: models.discountTicket
				}
            ],
            offset: offset,
            limit: limit,
            where: where,
            order: order
        })
        let count = await payLog.count({
            where: where
        })
        return {
            rows: result,
            count: count
        }
    }
    payLog.activeTicketList = async function (ctx, models){
    	let result = await models.payLog.findAll({
			//TODO:필요한 항목만 Attribute 추가)
			include: [
				{
					model: models.parkingSite,
					attribute: ['name', 'address', 'lat', 'lon']
				}
			],
			attributes: ['uid', 'carNumber', 'reserveTime', 'price', 'discountPrice', 'createdAt', 'totalPrice'],
			where: {
				userUid: ctx.user.uid,
				activeStatus: false,
				status: 10,
				cancelStatus: -1
			}
		})
		return result
	}
    return payLog
}
