const axios = require('axios')
const models = require('../../models')
const moment = require('moment')
const response = require('../../libs/response')
const nicePay = require('../../libs/nicePay')
const env = process.env.NODE_ENV || 'development'
const config = require('../../configs/config.json')[env]
const carWashBookingAPI = config.carWashBookingAPI
const jwt = require('../../libs/jwt')
exports.read = async function (ctx) {
    let {uid} = ctx.params
    let _ = ctx.request.query
    let carWash = await models.carWash.findByPk(uid)
    ctx.user = await jwt.getUser(ctx)
    if(carWash.bookingCode) {
        let params = {}
        if(ctx.user) {
            let car = null
            if(_.carUid) {
                car = await models.car.findByPk(_.carUid)
            }else {
                car = await models.car.findOne({
                    where: {
                        userUid: ctx.user.uid,
                        isMain: true
                    }
                })
            }
            if(car) {
                params.mobilxCarUid = car.mobilxCarUid
            }
        }
        let resProducts = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/${carWash.bookingCode}/products`, {
            params: params
        })
        let carWashData = await axios.get(carWashBookingAPI + `/api/carmeleon/carWashes/${carWash.bookingCode}`)
        let products = resProducts.data.data
        carWash.dataValues.carWashData = carWashData.data.data
        carWash.dataValues.products = products
    }

    response.send(ctx, carWash)
}

exports.list = async function (ctx) {
    let where       = {}
    let attributes = ['uid', 'carWashName', 'carWashType', 'rate', 'typeTag', 'timeTag', 'isRecommend', 'lat', 'lon', 'bookingCode', 'targetType']
    let carWashes = await models.carWash.findAll({ attributes, where })
	response.send(ctx, carWashes)
}

exports.check = async function (ctx) {
    let lastUpdated = await models.carWash.findOne({
        order: [['updatedAt', 'desc']]
    })
    response.send(ctx, moment(lastUpdated.updatedAt).format('YYYY-MM-DD HH:mm:ss'))
}


exports.getProductInfo = async function (ctx) {
    let {productUid} = ctx.params
    let _ = ctx.request.query
    ctx.user = await jwt.getUser(ctx)
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
        if(price !== null) {
            acc = acc + price
        }
        return acc
    }, 0)
    let finalPrice = productPrice + totalOptionPrice

    console.log('productPrice', productPrice)
    console.log('totalOptionPrice', totalOptionPrice)
    console.log('finalPrice', finalPrice)

    if(finalPrice !== _.finalPrice) {
        response.customError(ctx, '잘못된 가격 정보입니다.')
    }
    let optionPrices = []
    for(let optUid of _.options) {
        let productOptionIndex = productOptionUids.indexOf(Number(optUid))
        let productOption = productOptions[productOptionIndex]
        optionPrices.push({
            uid: productOption.uid,
            price: productOption.price,
            name: productOption.name
        })
    }
    let card = await models.card.findOne({
        where: {
            uid: _.cardUid,
            userUid: ctx.user.uid
        }
    })
    if(!card) {
        response.customError(ctx, '잘못된 카드 정보입니다.')
    }
    let user = await models.user.findByPk(ctx.user.uid)

    //결제
    let payResult = await nicePay.pgPaymentNice({
        userUid: user.uid,
        billKey: card.billKey,
        price: finalPrice,
        goodsName: product.name,
        buyerName: _.name,
        buyerEmail: user.email || 'mobilx.carmeleon@gmail.com',
        buyerTel: _.phone
    })
    if(payResult.resultCode !== '3001') {
        response.customError(ctx, '[결제실패] ' + payResult.resultMsg)
    }
    //결제부분 주석처리. 테스트완료.
    /*let payResult = {
        uid: 1,
        cardName: '현대',
        cardCode: '04',
        tid: 'testtid',
        moid: 'testmoid',
        cardNumber: card.maskingCardNumber,
    }*/

    console.log({
        userUid: user.uid,
        price: _.finalPrice,
        payResultUid: payResult.uid,
        cardName: payResult.cardName,
        cardCode: payResult.cardCode,
        tid: payResult.tid,
        cardNumber: card.maskingCardNumber,
        moid: payResult.moid,
    })

    let formData = {
        vendorCode: 'carmeleon',
        vendorCarWashUid: carWash.uid,
        vendorUserKey: user.uid,
        carWashUid: carWash.bookingCode,
        productUid: _.productUid,
        bookingDateTime: _.bookingDate + ' ' + _.bookingTime,
        bookingDate: _.bookingDate,
        bookingTime: _.bookingTime,
        name: _.name,
        phone: _.phone,
        mobilxCarUid: car.mobilxCarUid,
        carBrand: car.brand,
        carModel: car.model,
        carPlate: car.carPlate,
        options: _.options,
        productPrice: _.productPrice,
        totalOptionPrice: _.totalOptionPrice,
        finalPrice: _.finalPrice,
        requireExtraPay: _.requireExtraPay,
        optionPrices: optionPrices,
        paymentsData: {
            userUid: user.uid,
            price: _.finalPrice,
            payResultUid: payResult.uid,
            cardName: payResult.cardName,
            cardCode: payResult.cardCode,
            tid: payResult.tid,
            cardNumber: card.maskingCardNumber,
            moid: payResult.moid
        }
    }
    let booking = await axios.post(carWashBookingAPI + `/api/carmeleon/bookings`, formData)

    response.send(ctx, booking.data.data)
}

exports.getBookings = async function (ctx) {
    let _ = ctx.request.query
    let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings`, {
        params: {
            ..._,
            vendorUserKey: ctx.user.uid
        }
    })
    response.send(ctx, res.data.data)
}

exports.getBooking = async function (ctx) {
    let { uid } = ctx.params
    let res = await axios.get(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`)
    response.send(ctx, res.data.data)
}

exports.putBooking = async function (ctx) {
    let { uid } = ctx.params
    let _ = ctx.request.body
    let res = await axios.put(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`, _)
    response.send(ctx, res.data.data)
}

exports.cancelPayment = async function (ctx) {
    let _ = ctx.request.body
    let result = await nicePay.pgPaymentCancelNice(_)
    response.send(ctx, result)
}

exports.bookingRefundRequest = async function (ctx) {
    let { uid } = ctx.params
    let _ = ctx.request.body
    let res = await axios.put(carWashBookingAPI + `/api/carmeleon/bookings/${uid}`, {
        status: 'CANCEL',
        cancelStatus: 0,
        cancelReason: _.cancelReason,
        cancelRequestTime: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    response.send(ctx, res.data.data)
}
