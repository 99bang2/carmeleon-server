const models = require('../models')
const response = require('../libs/response')
const moment = require('moment')
const parkingTicketLib = require('../libs/parkingTicket')

exports.read = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let parkingSite = await models.parkingSite.findByPk(uid)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: 0,
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
	let _ = ctx.request.query
    let longitude = _.lon ? parseFloat(_.lon) : null
    let latitude = _.lat ? parseFloat(_.lat) : null
    let radius = _.radius
    let where = [{
	    is_active: true,
    }]
    let order= [['isRecommend', 'asc'], ['price', 'desc']]
    if(radius) {
        let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
        where.push(distanceQuery)
    }
    let attributes = ['uid', 'name', 'isBuy', 'rate', 'optionTag', 'valetType', 'isRecommend', 'price', 'lat', 'lon', 'targetType']
    let parkingSites = await models.parkingSite.findAll({ attributes, where, order })
	response.send(ctx, parkingSites)
}

exports.check = async function (ctx) {
    let lastUpdatedParkingSite = await models.parkingSite.findOne({
        order: [['updatedAt', 'desc']]
    })
    response.send(ctx, moment(lastUpdatedParkingSite.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
}

exports.bookingList = async function (ctx) {
    let parkingSites = await models.parkingSite.findAll({
        where: {
            isBuy : true
        }})
    response.send(ctx, parkingSites)
}
