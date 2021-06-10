const models = require('../../models')
const response = require('../../libs/response')
const Sequelize = require('sequelize')
const Op = Sequelize.Op


exports.list = async function (ctx) {
    let configs = await models.config.getVersions(models)
    response.send(ctx, configs)
}

exports.update = async function (ctx) {
    let _ = ctx.request.body
    let {os} = ctx.params

    let versions = await models.config.count({
        where : { key: { [Op.like]: "%version" } }
    })

    if(versions === 0) await models.config.initVersions()

    let appLatestVersionKey = os + '-latest-version'
    let appLatestVersionConfig = await models.config.findOne({
        where: {
            key : appLatestVersionKey
        }
    })

    Object.assign(appLatestVersionConfig, {key : appLatestVersionKey, value: _.latest})
    await appLatestVersionConfig.save()

    let appMinimumVersionKey = os + '-minimum-version'
    let appMinimumVersionConfig = await models.config.findOne({
        where: {
            key : appMinimumVersionKey
        }
    })

    Object.assign(appMinimumVersionConfig, {key : appMinimumVersionKey, value: _.minimum})
    await appMinimumVersionConfig.save()

    response.send(ctx)
}
