'use strict'
const common = require('./common')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const ip = require('ip')
const time = moment().format("YYYYMMDDHHmmss");
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]

exports.imageUpload = function imageUpload(ctx, file, dir, folder, name){
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir)
	}
	//확장자 체크
	if(file.type.indexOf('image') === -1){
		fs.unlinkSync(file.path)
		ctx.throw({
			code: 400,
			message: '확장자가 이지미 파일이어야 합니다.'
		})
	}
	//파일 용량, 사이즈 정의 필요
	let imagePath = file.path
	let address = 'http://'+ip.address()+':'+config.listenPort+'/'
	let fileExt = path.extname(imagePath)
	if(!name){
		name = common.randomString(5)+'_'
	}
	let fileName = name + time + fileExt
	let newPath = dir + fileName
	fs.renameSync(imagePath, newPath)
	return address + folder + fileName
}
