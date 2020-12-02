const models = require('../models')
const response = require('../libs/response')

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let carWash = await models.carWash.findByPk(uid)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: 3,
                targetUid: uid,
                userUid: ctx.user.uid
            }
        })
        carWash.dataValues.favoriteFlag = favorite > 0
    }else {
        carWash.dataValues.favoriteFlag = false
    }
    response.send(ctx, carWash)
}

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
    let attributes = ['uid', 'carWashName', 'carWashType', 'rate', 'typeTag', 'timeTag', 'isRecommend', 'lat', 'lon', 'bookingCode', 'targetType']
    let carWashes = await models.carWash.findAll({ attributes, where })
	response.send(ctx, carWashes)
}
