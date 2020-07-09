const models = require('../models')
const response = require('../libs/response')
const jsonfile = require('jsonfile')
const tutorialFiles = __dirname + '/../configs/tutorial.json'
const imageUpload = require('../libs/imageUpload')
const dir = './uploads/tutorial/'
const folder = 'tutorial/'

exports.readTutorial = async () => {
	let tutorial = await jsonfile.readFileSync(tutorialFiles, {
		throws: false
	})
	return tutorial
}

exports.getTutorial = async (ctx) => {
	let tutorial = await this.readTutorial()
	response.send(ctx, tutorial)
}

exports.setTutorial = async function(ctx) {
	let _ = ctx.request.body
	//튜토리얼 JSON 파일 생성
	let tutorialImageFile = ctx.request.files.stepImage
	let tutorialArray = []
	for(let i=0; i<tutorialImageFile.length; i++){
		tutorialArray.push(imageUpload.imageUpload(ctx, tutorialImageFile[i], dir, folder, 'tutorial_'))
	}
	let tutorial = await jsonfile.writeFileSync(tutorialFiles, tutorialArray, {
		spaces: 2,
		EOL: '\r\n'
	})
	response.send(ctx, tutorial)
}
