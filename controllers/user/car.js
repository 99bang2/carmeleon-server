const models = require('../../models')
const response = require('../../libs/response')

exports.create = async function (ctx) {
	let _ = ctx.request.body
	let alreadyCar = await models.car.findOne({
		where: {
			userUid: ctx.user.uid,
			carPlate: _.carPlate
		}
	})
	if(alreadyCar){
		ctx.throw({
			code: 400,
			message: '이미 등록 된 차량 입니다.'
		})
	}
	let count = await models.car.count({
		where : {
			userUid: ctx.user.uid
		}
	})
	let car = await models.car.create({
		userUid: ctx.user.uid,
		brand: _.brand,
		model: _.model,
		carModel: _.brand + ' ' + _.model,
		carPlate: _.carPlate,
		isMain: count === 0,
		mobilxCarUid: _.mobilxCarUid
	})
	response.send(ctx, car)
}

exports.list = async function (ctx) {
	let where = { userUid: ctx.user.uid }
	let order = [['isMain', 'DESC']]
	let cars = await models.car.findAll({where, order})
	response.send(ctx, cars)
}

exports.updateMain = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	if(car.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	await models.car.update(
		{ isMain: false },
		{ where: { userUid: ctx.user.uid }}
	)
	car.isMain = true
	await car.save()
	let where = { userUid: ctx.user.uid }
	let order = [['isMain', 'DESC']]
	let cars = await models.car.findAll({where, order})
	response.send(ctx, cars)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	if(car.userUid !== ctx.user.uid) {
		response.unauthorized(ctx)
	}
	await car.destroy()
	response.send(ctx, car)
}
