const models = require('../../models')
const response = require('../../libs/response')
const jwt = require('../../libs/jwt')
const moment = require('moment')
const parkingTicketLib = require('../../libs/parkingTicket')
const TARGET_TYPE = 0
exports.read = async function (ctx) {
    let {uid} = ctx.params
    let parkingSite = await models.parkingSite.findByPk(uid)
    ctx.user = await jwt.getUser(ctx)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: TARGET_TYPE,
                targetUid: uid,
                userUid: ctx.user.uid
            }
        })
        parkingSite.dataValues.favoriteFlag = favorite > 0
    }else {
        parkingSite.dataValues.favoriteFlag = false
    }
    let discountTickets = await models.discountTicket.findAll({
        where: {
            siteUid: uid,
            ticketStartDate: {
                [models.Sequelize.Op.lte]: moment().format('YYYY-MM-DD 09:00')
            },
            ticketEndDate: {
                [models.Sequelize.Op.gte]: moment().format('YYYY-MM-DD 09:00')
            },
            isActive: true,
            ticketCategory: 1
        }
    })
    let currentDate = moment(moment().format('YYYY-MM-DD'))
    for(let discountTicket of discountTickets) {
        let openTime = await parkingTicketLib.getOpenTime(discountTicket)
        discountTicket.dataValues.expire = !!openTime
        discountTicket.dataValues.openTime = openTime
        discountTicket.dataValues.sold_out = false
        if(!openTime) {
            let todayCount = await models.payLog.count({
                where: {
                    discountTicketUid: discountTicket.uid,
                    createdAt: {
                        [models.Sequelize.Op.gte]: currentDate.format('YYYY-MM-DD')
                    },
                    status: {
                        [models.Sequelize.Op.in]: [0, 10]
                    }
                }
            })
            if(todayCount >= discountTicket.ticketCount) {
                discountTicket.dataValues.sold_out = true
            }
        }
    }
    parkingSite.dataValues.discountTickets = discountTickets
    response.send(ctx, parkingSite)
}

exports.list = async function (ctx) {
    let where = { isActive: true }
    let order= [['isRecommend', 'asc'], ['price', 'desc']]
    let attributes = ['uid', 'name', 'isBuy', 'rate', 'optionTag', 'valetType', 'isRecommend', 'price', 'lat', 'lon', 'targetType']
    let parkingSites = await models.parkingSite.findAll({ attributes, where, order })
	response.send(ctx, parkingSites)
}

exports.check = async function (ctx) {
    let lastUpdatedParkingSite = await models.parkingSite.findOne({ order: [['updatedAt', 'desc']] })
    response.send(ctx, moment(lastUpdatedParkingSite.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
}

exports.bookingList = async function (ctx) {
    let parkingSites = await models.parkingSite.findAll({
        where: {
            isBuy : true
        }})
    response.send(ctx, parkingSites)
}
