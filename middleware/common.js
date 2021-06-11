'use strict'
const AVAILABLE_TARGET_TYPES = ["0", "1", "2", "3"]
exports.isAvailableTarget = async (ctx, next) => {
	let {targetType} = ctx.params
	if (AVAILABLE_TARGET_TYPES.indexOf(targetType) < 0) {
		ctx.throw({
			code: 400,
			message: '잘못된 요청입니다.'
		})
	}
	await next()
}
