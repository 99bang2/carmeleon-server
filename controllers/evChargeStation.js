const models = require('../models')
const response = require('../libs/response')
const moment = require('moment')

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let longitude = _.lon ? parseFloat(_.lon) : null
    let latitude = _.lat ? parseFloat(_.lat) : null
    let radius = _.radius
    let where = {}
    if(radius) {
        let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
        where = [distanceQuery]
    }
    let attributes = ['uid', 'statNm', 'evType', 'rate', 'tag', 'availableStall', 'isRecommend', 'updateTime', 'lat', 'lon', 'stall', 'targetType']
    let include = [{
        model: models.evCharger,
        attributes: ['stat']
    }]
    let evChargeStations = await models.evChargeStation.findAll({include, attributes, where})
	response.send(ctx, evChargeStations)
}

exports.check = async function (ctx) {
    let lastUpdated = await models.evChargeStation.findOne({
        order: [['updatedAt', 'desc']]
    })
    response.send(ctx, moment(lastUpdated.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
}

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let evChargeStation = await models.evChargeStation.findByPk(uid, {
        include: [{
            model: models.evCharger
        }]
    })
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: 1,
                targetUid: uid,
                userUid: ctx.user.uid
            }
        })
        evChargeStation.dataValues.favoriteFlag = favorite > 0
    }else {
        evChargeStation.dataValues.favoriteFlag = false
    }
    response.send(ctx, evChargeStation)
}
