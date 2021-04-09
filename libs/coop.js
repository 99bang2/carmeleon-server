'use strict'

const env 		= process.env.NODE_ENV || 'development'
const config    = require('../configs/config.json')[env]
const Coop      = require('../configs/coop.json')
const axios     = require('axios')

const param = {
    AuthKey: Coop.appKey,
    ProcessType: '',
    CompCode: '',
    ConponNumber: '',
    BranchCode: '',
    ConponType: Coop.couponType.payment,
    AuthPrice: '',
    OriginalAuthCode:''
}

module.exports = {
    async addCoupon(couponNumber) {
        let url = Coop.url + Coop.path

        param.ProcessType = Coop.processType.use
        param.ConponNumber = couponNumber

        return await axios.post(url, param)
    },
    async useCoupon(coupon) {
        let url = Coop.url + Coop.path
        param.ProcessType = Coop.processType.use
        param.ConponNumber = coupon.couponNum
        // Todo: 가격 변수 입력
        // param.AuthPrice = coupon

        return await axios.post(url, param)
    },
    cancelCoupon() {

    },
    async checkCoupon(couponNumber) {
        let url = Coop.url + Coop.path

        param.ProcessType = Coop.processType.check
        param.ConponNumber = couponNumber

        return await axios.post(url, param)
    }
}