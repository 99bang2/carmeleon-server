const models = require('../models')
const response = require('../libs/response')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const axios = require('axios')

exports.teslaLogin = async function (ctx) {
	let _ = ctx.request.body
	let data = {
		"email": _.email,
		"password": _.password
	}
	let vehicleData = await getVehicleId(data)
	//에러 처리 서버 or 클라 count가 0 or data null
	response.send(ctx, vehicleData)
}
exports.teslaData = async function (ctx) {
	let _ = ctx.request.body
	let data = {
		"email": _.email,
		"password": _.password
	}
	let vehicleData = await getVehicleId(data)
	//online 상태가 아닐 시 wakeup
	if(vehicleData.data[0].state !== "online"){
		await wakeVehicle(vehicleData.accessToken, vehicleData.data[0].id)
		//깨웠을 경우 알림 추가 예정//
	}
	let chargeData = await chargeList(vehicleData.accessToken, vehicleData.data[0].id)
	response.send(ctx, chargeData.response)
}
async function getVehicleId(teslaData){
	let options = {
		"grant_type": "password",
		"client_id": config.teslaId,
		"client_secret": config.teslaSecret
	}
	Object.assign(options, teslaData)
	let data = await axios.post(config.teslaUrl+"oauth/token", options)
		.then(async (data) => {
			let accessToken = data.data.access_token
			let vehicleData = await axios.get(config.teslaUrl+"api/1/vehicles", {
				headers : {
					"Authorization": "Bearer "+accessToken
				}
			}).then((res)=>{
				let vehicleInfo = {
					count : res.data.count,
					data : res.data.response
				}
				return vehicleInfo
			}).catch((err)=>{
				console.log('err')
			})
			vehicleData.accessToken = accessToken
			return vehicleData
		})
	return data
}
async function wakeVehicle(accessToken, vehicleId){
	let data = await axios.post(config.teslaUrl+`api/1/vehicles/${vehicleId}/wake_up`,null,{headers: {
		"Authorization": "Bearer "+accessToken
	}})
	return data
}
async function chargeList(accessToken, vehicleId){
	let data = await axios.get(config.teslaUrl+`api/1/vehicles/${vehicleId}/nearby_charging_sites`, {
		headers : {
			"Authorization": "Bearer "+accessToken
		}
	})
	return data.data
}
