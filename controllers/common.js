'use strict'
const models = require('../models')
const response = require('../libs/response')
const jwt = require('jsonwebtoken')
const env = process.env.NODE_ENV || 'development'
const config = require('../configs/config.json')[env]
const secret = config.secretKey
const imageUpload = require('../libs/imageUpload')

exports.fileUpload = async function (ctx){
	let _ = ctx.request.body
	let folder = _.dir+'/'
	let dir = './uploads/'+folder
	let file = ctx.request.files.file
	let filePath = imageUpload.imageUpload(ctx, file, dir, folder)
	response.send(ctx, filePath)
}
