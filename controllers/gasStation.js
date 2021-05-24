const models = require('../models')
const response = require('../libs/response')
const moment = require('moment')

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let gasStation = await models.gasStation.findByPk(uid)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: 2,
                targetUid: uid,
                userUid: ctx.user.uid
            }
        })
        gasStation.dataValues.favoriteFlag = favorite > 0
    }else {
        gasStation.dataValues.favoriteFlag = false
    }
    response.send(ctx, gasStation)
}

exports.list = async function (ctx) {
	/*let _ = ctx.request.query
    let longitude = _.lon ? parseFloat(_.lon) : null
    let latitude = _.lat ? parseFloat(_.lat) : null
    let radius = _.radius*/
    let where = {}
    /*if (radius) {
        let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
        where = [distanceQuery]
    }*/
    let attributes = ['uid', 'gasStationName', 'brandCode', 'lat', 'lon','rate', 'isRecommend', 'tag', 'Gasoline', 'Diesel', 'PremiumGasoline', 'lpg', 'targetType']
    let gasStations = await models.gasStation.findAll({ attributes, where })

	response.send(ctx, gasStations)
}

exports.check = async function (ctx) {
    let lastUpdated = await models.gasStation.findOne({
        order: [['updatedAt', 'desc']]
    })
    response.send(ctx, moment(lastUpdated.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
}
