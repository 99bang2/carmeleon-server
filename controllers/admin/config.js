const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
    let _ = ctx.request.body
    let config = await models.config.create(_)
    response.send(ctx, config)
}

exports.list = async function (ctx) {
    let _ = ctx.request.query
    let configs = await models.config.search(_, models)
    response.send(ctx, configs)
}

exports.update = async function (ctx) {
    let {uid} = ctx.params
    let config = await models.config.getByUid(ctx, uid, models)
    let _ = ctx.request.body
    Object.assign(config, _)
    await config.save()
    response.send(ctx, config)
}

exports.delete = async function (ctx) {
    let {uid} = ctx.params
    let config = await models.config.getByUid(ctx, uid, models)
    await config.destroy()
    response.send(ctx, config)
}

exports.bulkDelete = async function (ctx) {
    let _ = ctx.request.body
    let deleteResult= await models.config.destroy({
        where: {
            uid: _.uids
        }
    })
    response.send(ctx, deleteResult)
}

exports.checkUniqueKey = async function (ctx) {
    let {key} = ctx.params
    let {uid} = ctx.request.query

    if (uid) {
        let uniqueUid = await models.config.findOne({
            where: {
                key: key,
                uid: uid
            },
            paranoid: false
        })
        if (uniqueUid) {
            return response.send(ctx, true)
        }
    }

    let unique = await models.config.findOne({
        attributes: ['uid', 'key'],
        where: {
            key: key
        },
        paranoid: false
    })
    if (unique) {
        ctx.throw({
            code: 400,
            message: '이미 존재 하는 key 입니다.'
        })
    }
    let result = !unique
    response.send(ctx, result)
}
