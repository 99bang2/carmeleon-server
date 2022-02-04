const models = require('../../models')
const response = require('../../libs/response')
const nicePay = require("../../libs/nicePay");
const Sequelize = require('sequelize')
const Op = Sequelize.Op
exports.check = async function (ctx) {
    let _ = ctx.request.body
    let parkingSite = await models.parkingSite.findOne({
        where: {
            autoPassCode : _.autoPassCode
        }
    })
    if(!parkingSite){
        response.badRequest()
    }
    let car = await models.car.findOne({
        where: {
            carPlate: _.carPlate
        }
    })
    console.log('##########', car.userUid)

    if(!car.isAutoPass) {
        response.badRequest()
    }
    let user = await models.user.findOne({
        include: [
            {
                model: models.car,
            },
            {
                model: models.card,
            }
        ],
        where: {
            uid: car.userUid
        }
    })
    if(!user.isAutoPass){
        response.badRequest()
    }

    let filteredCards =user.cards.filter((card) => card.isAutoPass)
    let card = filteredCards[0]
    if(!card.isAutoPass){
        response.badRequest()
    }
    response.send(ctx, {user: user.uid})
}
exports.enableAutoPassList = async function (ctx) {
    let parkingList = await models.parkingSite.findAll({
        where: {
            autoPassCode : {
                [Op.ne]: null
            }
        }
    })
    response.send(ctx, {data: parkingList})
}

exports.getAutoPass = async function(ctx) {
    let {uid} = ctx.params
    let user = await models.user.findOne({
        include: [
            {
                model: models.car,
            },
            {
                model: models.card,
            }
        ],
        where: {
            uid: uid
        }
    })
    let filteredCards =user.cards.filter((card) => card.isAutoPass)
    let card = filteredCards[0]
    let filteredCars =user.cars.filter((car) => car.isAutoPass)
    let car = filteredCars[0]

    response.send(ctx, {user,car,card})
}
exports.requestPayment = async function (ctx) {
    let _ = ctx.request.body
    let price = _.price
    let carPlate = _.carPlate
    let parkingSite = await models.parkingSite.findOne({
        where: {
            autoPassCode : {
                [Op.ne]: null
            }
        }
    })

    let user = await models.user.findOne({
        include: [
            {
                model: models.car,
            },
            {
                model: models.card,
            }
        ],
        where: {
            uid: _.uid
        }
    })
    let filteredCards =user.cards.filter((card) => card.isAutoPass)
    let card = filteredCards[0]
    // 결제

    // 자동결제 요청

    let totalPrice 		= Number(_.price)

    // 가격 확인
    if(totalPrice !== Number(_.price)) {
        response.customError(ctx, '잘못된 요금입니다.')
    }
    // 데이터 생성 (LOCK)
    let payLog = await models.payLog.create({
        carNumber			: carPlate,
        reserveTime			: '',
        payType				: 'autoPass',
        siteUid				: parkingSite.uid,
        cardUid				: card.uid,
        discountTicketUid	: null,
        status				: 10,
        sellingPrice		: 0,
        discountPrice		: 0,
        price				: price,
        totalPrice			: totalPrice,
        userUid				: user.uid,
        phoneNumber			: user.phone || '01000000000',
        email				: user.email || 'mobilx.carmeleon@gmail.com',
        activeStatus		: false,
        cancelStatus		: -1,
        expired				: false
    })
    // 결제금액이 있을 경우 결제 처리.
    if (totalPrice) {
        let payResult = await nicePay.pgPaymentNice({
            userUid: user.uid,
            billKey: card.billKey,
            price: totalPrice,
            goodsName: '자동결제',
            buyerName:  '사용자',
            buyerEmail: payLog.email || 'mobilx.carmeleon@gmail.com',
            buyerTel: payLog.phoneNumber
        })
        if(payResult.resultCode !== '3001') {
            payLog.status = -10
            await payLog.save()
            response.customError(ctx, '[결제실패] ' + payResult.resultMsg)
        }
        payLog.payResultUid = payResult.uid
        payLog.payOid = payResult.moid
        payLog.payTid = payResult.tid
        if(payResult.resultCode !== '2001') {
            await models.push.create({
                pushType 	: 1,
                title		: '자동결제가 완료되었습니다.',
                body		: `결제된 금액은 총 ${totalPrice}원 입니다.`,
                userToken	: user.token,
                userUid		: user.uid,
                sendDate	: Sequelize.fn('NOW')
            })
        }

    }
    payLog.status = 10
    payLog.activeStatus = true
    await payLog.save()
    response.send(ctx, payLog)

}
exports.registerIsAutoPass = async function(ctx) {
    let _ = ctx.request.body
    let user = await models.user.getByUid(ctx, _.userUid)
    let car =  await models.car.getByUid(ctx, _.carUid)
    let card = await models.card.getByUid(ctx,_.cardUid)
    user.isAutoPass = true
    car.isAutoPass = true
    card.isAutoPass = true
    await user.save()
    await car.save()
    await card.save()
    response.send(ctx, {user,car,card})
}
exports.terminateIsAutoPass = async function(ctx) {
    let _ = ctx.request.body
    console.log(_)
    let user = await models.user.getByUid(ctx, _.userUid)
    let car =  await models.car.getByUid(ctx, _.carUid)
    let card = await models.card.getByUid(ctx,_.cardUid)
    user.isAutoPass = false
    car.isAutoPass = false
    card.isAutoPass = false
    await user.save()
    await car.save()
    await card.save()
    response.send(ctx, {user,car,card})
}

exports.changeIsRead = async function(ctx) {
    let {uid} = ctx.params
    let payLogs = await models.payLog.findAll({
        where: {
            userUid: uid,
        }
    })
    for(let payLog of payLogs) {
        let autoPassLog = await models.payLog.findByPk(payLog.uid)
        autoPassLog.isRead = true
        await autoPassLog.save()
    }
    response.send(ctx, payLogs)
}