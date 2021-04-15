'use strict'

const env       = process.env.NODE_ENV || 'development'
const Coop      = require('../configs/coop.json')
const api       = Coop.api[env]
const crypto    = require('crypto')
const moment    = require('moment')
const parser    = require('xml2js').parseString
const soap      = require('easy-soap-request')
const pkcs7     = require('pkcs7')

const param = {
    SvcTpCd: '01',
    DealDay: null,
    DealTime: null,
    TracNo: '',
    UsecoTpCd: '1',
    PtnrCd: null,
    MersCd: null,
    BizNo: '',
    PosNo: null,
    GfctNo: null,
    GfctCertNo: null
}

const header = {
    'Content-Type': 'text/xml;charset=utf-8',
    SOAPAction: null
}

module.exports = {
    async addCoupon(couponNumber) {

    },
    async useCoupon(coupon) {

    },
    cancelCoupon() {

    },
    async checkCoupon(couponNumber) {
        let url = api.url + '?op=GetGiftcardInfo'
        header.SOAPAction = "http://authapi.paysgift.com/ApprovalApi/GetGiftcardInfo"

        let data = {
            couponNumber: encrypt(couponNumber)
        }

        let xml = requestXMLForm('info', data)

        console.log(xml)

        try {
            let response = await soap({
                method:'POST',
                headers: header,
                url: url,
                xml: xml,
                timeout: 1000
            })

            console.log('RESPONSE', response)
        } catch (e) {
            console.log('ERROR', e)
        }

        // const { response } = await soap({
        //     url: url,
        //     headers: header,
        //     xml: xml,
        //     timeout: 10000
        // })
        // const { body, statusCode } = response
        //
        // console.log(body)
        // console.log(statusCode)


    }
}

function encrypt(value) {

    let cipher = crypto.createCipheriv(api.algorithm, Buffer.from(api.key, 'hex'), Buffer.from(api.iv, 'hex'))
    cipher.setAutoPadding(false)

    let result = cipher.update(pkcs7Pad(value), undefined, 'base64')
    result += cipher.final('base64')

    return result
}

function decrypt(value) {

    let decipher = crypto.createDecipheriv(api.algorithm, Buffer.from(api.key, 'hex'), Buffer.from(api.iv, 'hex'))
    decipher.setAutoPadding(false)

    let result = decipher.update(value, "base64", "utf8")
    result += decipher.final("utf8")

    return pkcs7Unpad(result)
}

const pkcs7Pad = (params) => {
    const buffer = Buffer.from(params, "utf8")
    const bytes = new Uint8Array(buffer.length)
    let i = buffer.length
    while (i--) {
        bytes[i] = buffer[i]
    }
    return Buffer.from(pkcs7.pad(bytes))
}

const pkcs7Unpad = (params) => {
    const buffer = Buffer.from(params, "utf8")
    const bytes = new Uint8Array(buffer.length)
    let i = buffer.length
    while (i--) {
        bytes[i] = buffer[i]
    }
    const result = Buffer.from(pkcs7.unpad(bytes))
    return result.toString("utf8")
}

function requestXMLForm(type, data) {
    let request =
        `<SvcTpCd>01</SvcTpCd>` +
        `<DealDay>${moment().format('YYYYMMDD')}</DealDay>` +
        `<DealTime>${moment().format('HHmmss')}</DealTime>` +
        `<TracNo>1</TracNo>` +
        `<UsecoTpCd>1</UsecoTpCd>` +
        `<PtnrCd>P00313</PtnrCd>` +
        `<MersCd>app</MersCd>` +
        `<BizNo>1208811319</BizNo>` +
        `<PosNo>0000</PosNo>` +
        `<GfctNo>${data.couponNumber}</GfctNo>` +
        `<GfctCertNo></GfctCertNo>`

    switch (type) {
        case 'info':
            request =
                `<GetGiftcardInfo xmlns="http://authapi.paysgift.com/ApprovalApi">` +
                request +
                `</GetGiftcardInfo>`
            break
        case 'use':
            break
        case 'netCancel':
            break
    }


    return `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
        `<soap:Body>` +
        request +
        `</soap:Body>` +
        `</soap:Envelope>`
}