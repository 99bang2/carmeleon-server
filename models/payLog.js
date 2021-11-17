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
        carModel: {
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
        sellingPrice: {
            type: DataTypes.INTEGER
        },
        price: {
            type: DataTypes.INTEGER
        },
        discountPrice: {
            type: DataTypes.INTEGER
        },
        discountType: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        discountTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('discountType') !== null) {
                    return codes.discountType[this.getDataValue('discountType')]
                }
            }
        },
        point: {
            type: DataTypes.INTEGER,
            defaultValue: 0
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

                if (status === -10) { // 결제 실패

                } else {
                    // 결제성공 혹은 결제취소

                }


                if (status === 10 || status === -20) {
                    if (activeStatus) {
                        return 'used'
                    } else {
                        if (expired) {
                            return 'expired'
                        } else {
                            if (cancelStatus === 0) {
                                return 'refunding'
                            } else if (cancelStatus === 10) {
                                return 'refunded'
                            } else {
                                return 'paid'
                            }
                        }
                    }
                } else {
                    return 'none'
                }
            }
        },
        cancelRequestTime: {
            type: DataTypes.DATE
        },
        cancelCompleteTime: {
            type: DataTypes.DATE
        },
        coopPayment: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
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
                    paranoid: false
                }, {
                    model: models.card,
                    paranoid: false
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
        let offset = params.offset ? Number(params.offset) : null
        let limit = params.limit ? Number(params.limit) : null
        let order = [['createdAt', 'DESC']]

        if (params.searchData) {
            let searchData = JSON.parse(params.searchData)
            if (searchData.searchKeyword) {
                where = {
                    [Op.or]: [
                        {
                            '$parkingSite.name$':{
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        },
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
                        },
                        {
                            payOid: {
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        }
                    ]
                }
            }

            if (searchData.searchStatus) {
                where.status = [10, -20]
                switch (searchData.searchStatus) {
                    case 'all':
                        delete where.status
                        break
                    case 'used':
                        where.activeStatus = true
                        break
                    case 'expired':
                        where.expired = true
                        break
                    case 'refunding':
                        where.expired = false
                        where.cancelStatus = 0
                        break
                    case 'refunded':
                        where.expired = false
                        where.cancelStatus = 10
                        break
                    case 'paid':
                        where.expired = false
                        where.cancelStatus = {
                            [Op.notIn]: [0, 10]
                        }
                        break
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
            if (searchData.searchParkingSite) {
                where.siteUid = searchData.searchParkingSite
            }
        }

        // let accountUidWhere = params.accountUid !== undefined ? {accountUid: params.accountUid} : ''

        let rateWhere = 'target_type = 0 AND target_uid = payLog.site_uid AND user_uid = payLog.user_uid)'
        let result = await payLog.findAll({
            //TODO:추후 필요한 사항만 attribute 넣어 놓을 것
            attributes: {
                include: [
                    [`(SELECT count(uid) FROM ratings WHERE ` + rateWhere, 'rate_count']
                ],

            },
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['uid', 'name', 'address', 'lat', 'lon', 'accountUid'],
                    // where:accountUidWhere
                }, {
                    model: models.discountTicket,
                    attributes: ['siteUid', 'ticketDayType', 'ticketDayTypeName', 'ticketPrice', 'ticketPriceDiscount', 'ticketPriceDiscountPercent', 'ticketTime', 'ticketTitle', 'ticketType', 'ticketTypeName', 'uid']
                }, {
                    model: models.user,
                    attributes: ['uid', 'id', 'snsType', 'name', 'nickname', 'email', 'phone', 'profileImage', 'navigationType', 'marketing']
                },
            ],
            offset: offset,
            limit: limit,
            where: where,
            order: order
        })
        let count = await payLog.count({
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['uid', 'name', 'address', 'lat', 'lon', 'accountUid'],
                    // where: accountUidWhere
                }
            ],
            where: where
        })

        return {
            rows: result,
            count: count
        }
    }

    payLog.searchAll = async (params, models) => {
        let where = {}
        if (params.searchData) {
            let searchData = JSON.parse(params.searchData)
            if (searchData.searchKeyword) {
                where = {
                    [Op.or]: [
                        {
                            '$parkingSite.name$':{
                                [Op.like]: '%' + searchData.searchKeyword + '%'
                            }
                        },
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
            if (searchData.searchParkingSite !== "") {
                where.siteUid = searchData.searchParkingSite
            }
        }
        // let accountUidWhere = params.accountUid !== undefined ? {accountUid: params.accountUid} : ''

        let data = await payLog.findAll({
                include: [
                    {
                        model: models.parkingSite,
                        attributes: [],
                        // where: accountUidWhere
                    }
                ],
                where: where
            }
        )

        let price = 0
        let sellingPrice = 0
        let totalPrice = 0
        let totalCount = 0
        let completePrice = 0
        let cancelPrice = 0
        let priceCount = 0
        let sellingPriceCount = 0
        let completePriceCount = 0
        let cancelPriceCount = 0
        let fee = 0
        let feeCount = 0
        let refundCount = 0
        let refundPrice = 0
        let refundRejectCount = 0
        let refundRejectPrice = 0
        let refundCompleteCount = 0
        let refundCompletePrice = 0
        let usedCount = 0
        let unusedCount = 0
        let expiredCount = 0

        data.forEach(item => {
                price += item.price
                priceCount++
                sellingPrice += item.sellingPrice
                sellingPriceCount++
                totalPrice += item.totalPrice
                totalCount++
                fee += item.fee
                feeCount++
                //환불 신청
                if (item.cancelStatus === 0) {
                    refundPrice += item.price
                    refundCount++
                }
                //환불 완료
                if (item.cancelStatus === 10) {
                    refundCompletePrice += item.price
                    refundCompleteCount++
                    fee -= item.fee
                    feeCount--
                }
                //환불 거절
                if (item.cancelStatus === -10) {
                    refundRejectPrice += item.price
                    refundRejectCount++
                }
                if (item.activeStatus === true) {
                    usedCount++
                } else {
                    unusedCount++
                    if (item.expired) {
                        expiredCount++
                    }
                }
            }
        )

        let settleData = {
            price: price,
            sellingPrice: sellingPrice,
            totalPrice: totalPrice,
            totalCount: totalCount,
            completePrice: completePrice,
            cancelPrice: cancelPrice,
            priceCount: priceCount,
            sellingPriceCount: sellingPriceCount,
            completePriceCount: completePriceCount,
            cancelPriceCount: cancelPriceCount,
            fee: fee,
            feeCount: feeCount,
            refundCount: refundCount,
            refundPrice: refundPrice,
            refundRejectCount: refundRejectCount,
            refundRejectPrice: refundCompletePrice,
            refundCompleteCount: refundCompleteCount,
            refundCompletePrice: refundCompletePrice,
            usedCount: usedCount,
            unusedCount: unusedCount,
            expiredCount: expiredCount
        }
        console.log(settleData)
        return settleData
    }

    payLog.getByUserUid = async function (ctx, params, models) {
        let offset = null
        let limit = null
        let order = [['createdAt', 'DESC']]

        let where = {
            visible: true,
            status: {
                [Sequelize.Op.in]: [10, -20]
            },
            userUid: ctx.user.uid
        }

        if (params.page) {
            limit = 10
            offset = (Number(params.page) - 1) * limit
        }

        let result = await payLog.findAll({
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['name', 'address', 'lat', 'lon']
                }, {
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

    payLog.getByUserUidForAdmin = function (ctx, userUid, models) {
        let where = {
            userUid: userUid,
        }
        let order = [['createdAt', 'DESC']]
        return payLog.findAll({
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['name', 'address', 'lat', 'lon']
                }, {
                    model: models.discountTicket
                }
            ],
            where: where,
            order: order
        })
    }

    payLog.activeTicketList = async function (ctx, models) {
        return models.payLog.findAll({
            //TODO:필요한 항목만 Attribute 추가)
            include: [
                {
                    model: models.parkingSite,
                    attribute: ['name', 'address', 'lat', 'lon']
                },
                {
                    model: models.discountTicket
                }
            ],
            attributes: ['uid', 'carNumber', 'reserveTime', 'price', 'discountPrice', 'createdAt', 'totalPrice'],
            where: {
                userUid: ctx.user.uid,
                activeStatus: false,
                status: 10,
                cancelStatus: -1,
                expired: false
            }
        })
    }

    payLog.todayCount = async function (ticketUid, date) {
        return await payLog.count({
            where: {
                discountTicketUid: ticketUid,
                createdAt: {
                    [Op.gte]: date.format('YYYY-MM-DD')
                },
                status: {
                    [Op.in]: [0, 10]
                }
            }
        })
    }

    return payLog
}
