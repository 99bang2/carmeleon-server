'use strict'
const parkingSite = require('./parkingSite')
const evChargeStation = require('./evChargeStation')
const evCharge = require('./evCharge')
const gasStation = require('./gasStation')
const carWash = require('./carWash')
const rate = require('./rate')
const favorite = require('./favorite')
const user = require('./user')
const question = require('./question')
const push = require('./push')
const notice = require('./notice')
const event = require('./event')
const popup = require('./popup')
const account = require('./account')
const pointProduct = require('./pointProduct')
const pointOrder = require('./pointOrder')
const payLog = require('./payLog')
const pg = require('./pg')
const discountTicket = require('./discountTicket')
const statistics = require('./statistics')
const version = require('./version')
const config = require('./config')
const giftCard = require('./giftCard')

module.exports = {
	parkingSite,
	evChargeStation,
	evCharge,
	gasStation,
	carWash,
	rate,
	favorite,
	user,
	question,
	push,
	notice,
	event,
	popup,
	account,
	pointProduct,
	pointOrder,
	payLog,
	pg,
	discountTicket,
	statistics,
	version,
	config,
	giftCard
}
