'use strict'
const parkingSite = require('./parkingSite')
const evChargeStation = require('./evChargeStation')
const gasStation = require('./gasStation')
const carWash = require('./carWash')
const rate = require('./rate')
const favorite = require('./favorite')

module.exports = {
	parkingSite,
	evChargeStation,
	gasStation,
	carWash,
	rate,
	favorite
}
