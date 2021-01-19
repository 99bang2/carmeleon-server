const models = require('../models')
const response = require('../libs/response')

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
	let _ = ctx.request.query
	let cars = await models.car.search(_, models)
	response.send(ctx, cars)
}

exports.read = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	response.send(ctx, car)
}

exports.update = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	let _ = ctx.request.body
	Object.assign(car, _)
	await car.save()
	response.send(ctx, car)
}

exports.delete = async function (ctx) {
	let {uid} = ctx.params
	let car = await models.car.getByUid(ctx, uid)
	await car.destroy()
	response.send(ctx, car)
}

exports.userList = async function (ctx) {
	let {userUid} = ctx.params
	let car = await models.car.getByUserUid(ctx, userUid)
	response.send(ctx, car)
}

exports.carList = async function (ctx) {
	let {userUid} = ctx.params
	let _ = ctx.request.query
	_.userUid = userUid
	let cards = await models.car.search(_, models)
	response.send(ctx, cards)
}

exports.isMain = async function (ctx) {
	let _ = ctx.request.body
	await models.car.update(
		{ isMain: false },
		{ where: { userUid: _.userUid }}
	);
	let car = await models.car.update(
		{ isMain: true },
		{ where: { uid: _.uid }}
	);
	response.send(ctx, car)
}
