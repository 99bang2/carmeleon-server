const models = require('../../models')
const response = require('../../libs/response')
const moment = require('moment')
const jwt = require('../../libs/jwt')
const TARGET_TYPE = 2
exports.read = async function (ctx) {
    let {uid} = ctx.params
    let gasStation = await models.gasStation.findByPk(uid)
    ctx.user = await jwt.getUser(ctx)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: TARGET_TYPE,
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
    let where = {}
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
