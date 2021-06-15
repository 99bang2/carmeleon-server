const models = require('../../models')
const response = require('../../libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require('../../configs/config.json')[env]
const axios = require('axios')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const moment = require('moment')

exports.teslaLogin = async function (ctx) {
	let _ = ctx.request.body
	let data = {
		"email": _.email,
		"password": _.password
	}
	let vehicleData = await getVehicleId(data)
	if(vehicleData.success && vehicleData.success === false){
		ctx.throw({
			code: vehicleData.code,
			message: vehicleData.msg
		})
	}
	response.send(ctx, vehicleData)
}
exports.teslaData = async function (ctx) {
	let _ = ctx.request.body
	let data = {
		"email": _.email,
		"password": _.password
	}
	let res = {
		success: true,
		code: 100,
		msg: "성공"
	}
	let vehicleData = await getVehicleId(data)
	if (vehicleData.data.state !== "online") {
		let checkVehicle = await wakeVehicle(vehicleData.accessToken, vehicleData.data[0].id)
		//let checkVehicle = await wakeVehicle("qts-6483a6a879bdf615d9b400e49962717953b243439e1dc71933fa08641de18623", 153321439572)
		//깨웠을 경우 알림 추가 예정//
		if(checkVehicle.data.response.state !== "online"){
			ctx.throw({
				code: 301,
				message: "다시 시도해주세요."
			})
		}
	}
	let chargeData = await chargeList(vehicleData.accessToken, vehicleData.data[0].id)
	//let chargeData = await chargeList("qts-6483a6a879bdf615d9b400e49962717953b243439e1dc71933fa08641de18623", 153321439572)
	for (let i in chargeData.response.superchargers) {
		let name = chargeData.response.superchargers[i].name
		if (name.indexOf('-') !== -1) {
			name = name.replace('-', ' - ')
		}
		await models.evChargeStation.update(
			{availableStall: chargeData.response.superchargers[i].available_stalls}, {
				where: {
					evType: 1,
					statNm: {[Op.like]: "%" + name + "%"}
				}
			}
		)
	}
	response.send(ctx, res)
}

exports.teslaUpdate = async function (ctx) {
	let currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss')
	let _ = ctx.request.body
	let data = _.superchargers
	//console.log(data.response.superchargers)
	for (let i in data) {
		let compareName = data[i].compare_name
		await models.evChargeStation.update(
			{availableStall: data[i].available_stalls, updateTime: currentDateTime}, {
				where: {
					evType: 1,
					compareName: {[Op.like]: "%" + compareName + "%"}
				}
			}
		)
		response.send(ctx, true)
	}
}

async function getVehicleId(teslaData) {
	let options = {
		"grant_type": "password",
		"client_id": config.teslaId,
		"client_secret": config.teslaSecret
	}
	Object.assign(options, teslaData)
	let data = await axios.post(config.teslaUrl + "oauth/token", options)
	let accessToken = data.data.access_token
	let vehicleData = await axios.get(config.teslaUrl + "api/1/vehicles", {
		headers: {
			"Authorization": "Bearer " + accessToken
		}
	})
	let vehicleInfo = {
		count: vehicleData.data.count,
		data: vehicleData.data.response,
		accessToken: accessToken
	}
	return vehicleInfo
	/*let data = await axios.post(config.teslaUrl + "oauth/token", options)
		.then(async (data) => {
			let accessToken = data.data.access_token
			console.log('accessToken', accessToken)
			let vehicleData = await axios.get(config.teslaUrl + "api/1/vehicles", {
				headers: {
					"Authorization": "Bearer " + accessToken
				}
			}).then((res) => {
				console.log('res.data.coun', res.data.count)
				let vehicleInfo = {
					count: res.data.count,
					data: res.data.response
				}
				return vehicleInfo
			}).catch((err) => {
				console.log(err)
				return {
					success: false,
					code: 401,
					msg: "계정 정보를 확인 해주세요."
				}
			})
			/!*vehicleData.accessToken = accessToken
			return vehicleData*!/
		}).catch((err) => {
			console.log(err)
			if (err.response.status !== 200)
				return {
					success: false,
					code: 401,
					msg: "계정 정보를 확인 해주세요."
				}
		})*/
	/*let res = {}
	if (data.success === false){
		return data
	}
	res.success = true
	res.code = 100
	res.msg = "성공"
	/!*if (data.count === 0) {
		res.success = false
		res.code = 101
		res.msg = "차량이 1대 이상 있어야 합니다."
	}*!/
	return res*/
}

async function wakeVehicle(accessToken, vehicleId) {
	let data = await axios.post(config.teslaUrl + `api/1/vehicles/${vehicleId}/wake_up`, null, {
		headers: {
			"Authorization": "Bearer " + accessToken
		}
	})
	return data
}

async function chargeList(accessToken, vehicleId) {
	let data = await axios.get(config.teslaUrl + `api/1/vehicles/${vehicleId}/nearby_charging_sites`, {
		headers: {
			"Authorization": "Bearer " + accessToken
		}
	})
	return data.data
}
