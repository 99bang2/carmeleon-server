const models = require('../models')
const response = require('../libs/response')
const moment = require('moment')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let parkingSite = await models.parkingSite.create(_)
    response.send(ctx, parkingSite)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let parkingSite = await models.parkingSite.search(_, models)
	response.send(ctx, parkingSite)
}

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
            isActive: true
        }
    })
    let currentDate = moment(moment().format('YYYY-MM-DD'))
    let currentDay = parseInt(moment().format('E'))
    let currentDayType = (currentDay === 0 || currentDay === 6) ? 2 : 1
    for(let discountTicket of discountTickets) {
        discountTicket.dataValues.expire = false
        discountTicket.dataValues.sold_out = false
        if(discountTicket.ticketDayType < 3) {
            if(currentDayType !== discountTicket.ticketDayType) {
                discountTicket.dataValues.expire = true
            }
        }
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
    parkingSite.dataValues.discountTickets = discountTickets
    response.send(ctx, parkingSite)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.body
    let parkingSite = await models.parkingSite.getByUid(ctx, uid, _, models)
    Object.assign(parkingSite, _)
    await parkingSite.save()
    response.send(ctx, parkingSite)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
	let _ = ctx.request.query
    let parkingSite = await models.parkingSite.getByUid(ctx, uid, _, models)
    await parkingSite.destroy()
    response.send(ctx, parkingSite)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult = await models.parkingSite.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.userList = async function (ctx) {
	let _ = ctx.request.query
	let parkingSite = await models.parkingSite.userSearch(_, models)
	response.send(ctx, parkingSite)
}
