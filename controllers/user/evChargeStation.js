const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')
const jwt = require('../../libs/jwt')
const TARGET_TYPE = 1
exports.list = async function (ctx) {
    let where = {}
    let attributes = ['uid', 'statNm', 'evType', 'rate', 'tag', 'availableStall', 'isRecommend', 'updateTime', 'lat', 'lon', 'stall', 'targetType']
    let include = [{
        model: models.evCharger,
        attributes: ['stat']
    }]
    let evChargeStations = await models.evChargeStation.findAll({include, attributes, where})
	response.send(ctx, evChargeStations)
}

exports.listRealTime = async function (ctx) {
    let _ = ctx.request.query
    let longitude = _.lon ? parseFloat(_.lon) : '126.9783882'
    let latitude = _.lat ? parseFloat(_.lat) : '37.5666103'
    let radius = 10
    let where = {}
    let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
    where = [distanceQuery]
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
    ctx.user = await jwt.getUser(ctx)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: TARGET_TYPE,
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
