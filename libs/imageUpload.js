'use strict'
const common = require('./common')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ip = require('ip')
const time = moment().format("YYYYMMDDHHmmss");
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]

exports.imageUpload = function imageUpload(imagePath, dir, folder, name){
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}
	let address = 'http://'+ip.address()+':'+config.listenPort+'/'
	let fileExt = path.extname(imagePath)
	if(!name){
		name = common.randomString(5)
	}
	let fileName = name + time + fileExt
	console.log(fileName)
	let newPath = dir + fileName
	fs.renameSync(imagePath, newPath)
	console.log(imagePath)
	console.log(newPath)
	return address + folder + fileName
}
