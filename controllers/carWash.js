const axios = require('axios')
const models = require('../models')
const response = require('../libs/response')
const carWashBookingAPI = 'https://community.rocketlaunch.co.kr:5000'
//const carWashBookingAPI = 'http://localhost:4000'

exports.read = async function (ctx) {
    let {uid} = ctx.params
    let carWash = await models.carWash.findByPk(uid)
    if(ctx.user) {
        let favorite = await models.favorite.count({
            where: {
                targetType: 3,
                targetUid: uid,
                userUid: ctx.user.uid
            }
        })
        carWash.dataValues.favoriteFlag = favorite > 0
    }else {
        carWash.dataValues.favoriteFlag = false
    }
    if(carWash.bookingCode) {
        let params = {}
        if(ctx.user) {
            let mainCar = await models.car.findOne({
                where: {
                    userUid: ctx.user.uid,
                    isMain: true
                }
            })
            if(mainCar) {
                params.mobilxCarUid = mainCar.mobilxCarUid
            }
        }
        let resProducts = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/${carWash.bookingCode}/products`, {
            params: params
        })
        let products = resProducts.data.data
        carWash.dataValues.products = products
    }

    response.send(ctx, carWash)
}

exports.list = async function (ctx) {
	let _ = ctx.request.query
    let longitude = _.lon ? parseFloat(_.lon) : null
    let latitude = _.lat ? parseFloat(_.lat) : null
    let radius = _.radius
    let where = {}
    if(radius) {
        let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${latitude})) * cos(radians(lat)) * cos(radians(lon) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(lat))))`), '<=', radius)
        where = [distanceQuery]
    }
    let attributes = ['uid', 'carWashName', 'carWashType', 'rate', 'typeTag', 'timeTag', 'isRecommend', 'lat', 'lon', 'bookingCode', 'targetType']
    let carWashes = await models.carWash.findAll({ attributes, where })
	response.send(ctx, carWashes)
}

exports.getProductInfo = async function (ctx) {
    let {productUid} = ctx.params
    let _ = ctx.request.query

    let car = null
    if(_.carUid) {
        car = await models.car.findByPk(_.carUid)
    }else {
        if(ctx.user) {
            car = await models.car.findOne({
                where: {
                    userUid: ctx.user.uid,
                    isMain: true
                }
            })
        }
    }
    let params = {}
    if(car) {
        params.mobilxCarUid = car.mobilxCarUid
    }
    let resProduct = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/products/${productUid}`, {
        params: params
    })
    response.send(ctx, resProduct.data.data)
}

exports.getTimeSlots = async function (ctx) {
    let {uid, date} = ctx.params
    let carWash = await models.carWash.findByPk(uid)
    let result = null
    if(carWash.bookingCode) {
        let response = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/${carWash.bookingCode}/reserveSlots`, {
            params: {
                date: date
            }
        })
        result = response.data.data
    }
    response.send(ctx, result)
}

exports.booking = async function (ctx) {
    let _ = ctx.request.body
    let carWash = await models.carWash.findByPk(_.carWashUid)
    if(!carWash.bookingCode) {
        response.customError(ctx, '잘못된 세차장 정보입니다.')
    }
    let car = await models.car.findByPk(_.carUid)
    let params = {
        mobilxCarUid: car.mobilxCarUid
    }
    let resProduct = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/products/${_.productUid}`, {
        params: params
    })
    // 가격 검증
    let product = resProduct.data.data.product
    let productOptions = resProduct.data.data.productOptions
    let productPrice = product.price
    let productOptionUids = productOptions.map(({uid}) => uid)
    let totalOptionPrice = _.options.reduce((acc, cur) => {
        let productIndex = productOptionUids.indexOf(Number(cur))
        let productOption = productOptions[productIndex]
        let price = productOption.price
        if(acc === null || price === null) {
            acc = null
        }else {
            acc = acc + price
        }
        return acc
    }, 0)
    let finalPrice = productPrice === null || totalOptionPrice === null ? null : productPrice + totalOptionPrice
    if((finalPrice || _.finalPrice) && finalPrice !== _.finalPrice) {
        response.customError(ctx, '잘못된 가격 정보입니다.')
    }
    if(finalPrice) {
        //결제진행.
        let card = await models.card.findOne({
            where: {
                uid: _.cardUid,
                userUid: ctx.user.uid
            }
        })
        if(!card) {
            response.customError(ctx, '잘못된 카드 정보입니다.')
        }
    }
    let formData = {
        /*carWashUid: this.carWash.uid,
        carWashName: this.carWash.name,
        productUid: this.product.uid,
        bookingDateTime: this.reserveDate,
        bookingDate: this.selectedDate,
        bookingTime: this.selectedSlot,
        name: this.name,
        phone: this.phone,
        carUid: this.userCar.carUid,
        carPlate: this.userCar.plateNumber,
        options: this.selectedOptions,
        productPrice: this.productPrice,
        totalOptionPrice: this.totalOptionPrice,
        finalPrice: this.finalPrice,*/
    }
    response.send(ctx, formData)

}