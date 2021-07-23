'use strict'

const env = process.env.NODE_ENV || 'development'
// const env = 'production'
const Coop = require('../configs/coop.json')
const api = Coop.api[env]
const crypto = require('crypto')
const moment = require('moment')
const xml2js = require('xml2js')
const soap = require('easy-soap-request')
const pkcs7 = require('pkcs7')
const consola = require('consola')

const models    = require('../models')

const header = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'Content-Length': 'length',
    SOAPAction: null,
}

module.exports = {
    async useCoupon(info) {
        try {
            let giftCard = await models.giftCard.findOne({
                where: {
                    code: info.couponNumber
                }
            })
            if(giftCard) {
                if(giftCard.status === 'USED'){
                    return 'INACTIVE'
                }else {
                    giftCard.status = 'USED'
                    giftCard.usedAt = moment().format('YYYY-MM-DD HH:mm:ss')
                    await giftCard.save()
                    return {
                        couponNumber: info.couponNumber,
                        price: giftCard.price,
                        giftCardType: giftCard.publisher
                    }
                }
            }else {
                return 'MISMATCH'
            }
        } catch (e) {
            return 'SERVERERROR'
        }
    },
    async checkCoupon(couponNumber) {
        try {
            let giftCard = await models.giftCard.findOne({
                where: {
                    code: couponNumber
                }
            })
            if(giftCard) {
                if(giftCard.status === 'USED'){
                    return 'INACTIVE'
                }else {
                    return {
                        couponNumber: couponNumber,
                        price: giftCard.price,
                    }
                }
            }else {
                return 'MISMATCH'
            }
        } catch (e) {
            return 'SERVERERROR'
        }
    },
    async useCancel(data) {
        header.SOAPAction = api.action + '/UseCancel'

        let url = api.url + '?op=UseCancel'
        data.couponNumber = encrypt(data.couponNumber)

        let xml = requestXMLForm('cancel', data)

        try {
            let res = await soap({
                method: 'POST',
                headers: header,
                url: url,
                xml: xml,
                timeout: 5000,
            })

            let parser = new xml2js.Parser()

            return new Promise((resolve, reject) => {

                parser.parseString(res.response.body, (err, result) => {
                    if (err) {
                        consola.error('XML Parsing Error', err)
                        reject(err)
                    }

                    let envelope = Object.values(result)
                    let body = Object.values(envelope[0])
                    let info = body[1][0].UseCancelResponse
                    let _result = info[0].UseCancelResult
                    let apiResult = _result[0].ApiResult[0]

                    if (!_result[0].AprvResult) {
                        resolve('SERVERERROR')
                    }

                    let aprvResult = _result[0].AprvResult[0]

                    if (apiResult.$.ResultCd !== '0000') {
                        consola.error(`COOP ERROR CODE : ${apiResult.$.ResultCd}`)
                        resolve('MISMATCH')
                    }
                    if (aprvResult.$.GfctStat !== 'IF') {
                        consola.error('COOP Coupon Inactive')
                        resolve('INACTIVE')
                    }

                    resolve('SUCCESS')
                })
            })
        } catch (e) {
            consola.error('COOP CALL ERROR', e)
            return 'SERVERERROR'
        }
    },
    async useNetworkCancel(data) {
        header.SOAPAction = api.action + '/UseNetworkCancel'

        let url = api.url + '?op=UseNetworkCancel'
        data.couponNumber = encrypt(data.couponNumber)

        let xml = requestXMLForm('netCancel', data)

        try {
            let res = await soap({
                method: 'POST',
                headers: header,
                url: url,
                xml: xml,
                timeout: 5000,
            })

            let parser = new xml2js.Parser()

            return new Promise((resolve, reject) => {

                parser.parseString(res.response.body, (err, result) => {
                    if (err) {
                        consola.error('XML Parsing Error', err)
                        reject(err)
                    }

                    let envelope = Object.values(result)
                    let body = Object.values(envelope[0])
                    let info = body[1][0].UseNetworkCancelResponse
                    let _result = info[0].UseNetworkCancelResult
                    let apiResult = _result[0].ApiResult[0]

                    if (!_result[0].AprvResult) {
                        resolve('SERVERERROR')
                    }

                    let aprvResult = _result[0].AprvResult[0]

                    if (apiResult.$.ResultCd !== '0000') {
                        consola.error(`COOP ERROR CODE : ${apiResult.$.ResultCd}`)
                        resolve('MISMATCH')
                    }
                    if (aprvResult.$.GfctStat !== 'IF') {
                        consola.error('COOP Coupon Inactive')
                        resolve('INACTIVE')
                    }

                    resolve('SUCCESS')
                })
            })
        } catch (e) {
            consola.error('COOP CALL ERROR', e)
            return 'SERVERERROR'
        }
    },
}

function encrypt(value) {
    let algorithm = api.algorithm
    let key = Buffer.from(api.key, 'hex')
    let iv = Buffer.from(api.iv, 'hex')
    let cipher = crypto.createCipheriv(algorithm, key, iv)
    cipher.setAutoPadding(false)

    let result = cipher.update(pkcs7Pad(value), undefined, 'base64')
    result += cipher.final('base64')

    return result
}

function decrypt(value) {
    let algorithm = api.algorithm
    let key = Buffer.from(api.key, 'hex')
    let iv = Buffer.from(api.iv, 'hex')
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAutoPadding(false)

    let result = decipher.update(value, 'base64', 'utf8')
    result += decipher.final('utf8')

    return pkcs7Unpad(result)
}

const pkcs7Pad = (params) => {
    const buffer = Buffer.from(params, 'utf8')
    const bytes = new Uint8Array(buffer.length)

    let i = buffer.length

    while (i--) {
        bytes[i] = buffer[i]
    }

    return Buffer.from(pkcs7.pad(bytes))
}

const pkcs7Unpad = (params) => {
    const buffer = Buffer.from(params, 'utf8')
    const bytes = new Uint8Array(buffer.length)

    let i = buffer.length

    while (i--) {
        bytes[i] = buffer[i]
    }

    return Buffer.from(pkcs7.unpad(bytes)).toString('utf8')
}

function requestXMLForm(type, data) {
    let request

    switch (type) {
        case 'info':
            request =
                `<GetGiftcardInfo xmlns="${api.action}">` +
                `<req` +
                ` SvcTpCd="00"` +
                ` DealDay="${moment().format('YYYYMMDD')}"` +
                ` DealTime="${moment().format('HHmmss')}"` +
                ` TracNo=""` +
                ` UsecoTpCd="1"` +
                ` PtnrCd="${api.partnerCode}"` +
                ` MersCd="PAYS_WEB"` +
                ` BizNo="1208811319"` +
                ` PosNo="0000"` +
                ` GfctNo="${data.couponNumber}"` +
                ` GfctCertNo=""` +
                ` />` +
                `</GetGiftcardInfo>`
            break
        case 'use':
            request =
                `<Use xmlns="${api.action}">` +
                `<req` +
                ` SvcTpCd="00"` +
                ` DealDay="${moment().format('YYYYMMDD')}"` +
                ` DealTime="${moment().format('HHmmss')}"` +
                ` TracNo="${data.tracNo}"` +
                ` UsecoTpCd="1"` +
                ` PtnrCd="${api.partnerCode}"` +
                ` MersCd="PAYS_WEB"` +
                ` BizNo="1208811319"` +
                ` PosNo="0000"` +
                ` GfctNo="${data.couponNumber}"` +
                ` GfctCertNo=""` +
                ` DealOrdNo=""` +
                ` AdjDay="${moment().format('YYYYMMDD')}"` +
                ` DealAmt="${data.price}"` +
                ` />` +
                '</Use>'
            break
        case 'cancel':
            request =
                `<UseCancel xmlns="${api.action}">` +
                `<req` +
                ` SvcTpCd="00"` +
                ` DealDay="${data.approvalDate}"` +
                ` DealTime="${data.approvalTime}"` +
                ` TracNo="${moment().format('YYYYMMDDHHmmss')}"` +
                ` UsecoTpCd="1"` +
                ` PtnrCd="${api.partnerCode}"` +
                ` MersCd="PAYS_WEB"` +
                ` BizNo="1208811319"` +
                ` PosNo="0000"` +
                ` GfctNo="${data.couponNumber}"` +
                ` GfctCertNo=""` +
                ` DealOrdNo=""` +
                ` AdjDay="${moment().format('YYYYMMDD')}"` +
                ` OrgAprvDay="${data.approvalDate}"` +
                ` OrgAprvTime="${data.approvalTime}"` +
                ` OrgDealAmt="${data.price}"` +
                ` />` +
                '</UseCancel>'
            break
        case 'netCancel':
            request =
                `<UseCancel xmlns="${api.action}">` +
                `<req` +
                ` SvcTpCd="00"` +
                ` DealDay="${moment().format('YYYYMMDD')}"` +
                ` DealTime="${moment().format('HHmmss')}"` +
                ` TracNo="${data.tracNo}"` +
                ` UsecoTpCd="1"` +
                ` PtnrCd="${api.partnerCode}"` +
                ` MersCd="PAYS_WEB"` +
                ` BizNo="1208811319"` +
                ` PosNo="0000"` +
                ` GfctNo="${data.couponNumber}"` +
                ` GfctCertNo=""` +
                ` DealOrdNo=""` +
                ` AdjDay="${moment().format('YYYYMMDD')}"` +
                ` OrgAprvDay="${data.approvalDate}"` +
                ` OrgAprvTime="${data.approvalTime}"` +
                ` OrgDealAmt="${data.price}"` +
                ` />` +
                '</UseCancel>'
            break
    }

    return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
        ` <soap:Body>` +
        request +
        ` </soap:Body>` +
        `</soap:Envelope>`
}
