'use strict';

function AuthCode (redisClient) {
    this.name = 'authCode';
    this.redisClient = redisClient;
    return this
}

AuthCode.prototype._getKey = function(phoneNumber) {
    return [
        this.name,
        phoneNumber,
    ].join(':');
}

AuthCode.prototype.save = async function (phoneNumber, code) {
    let key = this._getKey(phoneNumber);
    let r = await this.redisClient.setAsync(key, code, 'EX', 600)
    return r;
}

AuthCode.prototype.read = async function (phoneNumber) {
    let key = this._getKey(phoneNumber);
    let r = await this.redisClient.getAsync(key)
    return JSON.parse(r);
}

AuthCode.prototype.remove = async function (phoneNumber) {
    let key = this._getKey(phoneNumber);
    let r = await this.redisClient.delAsync(key)
    return r;
}

module.exports = AuthCode;