'use strict'
const response = require('../libs/response')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
    const config = sequelize.define('config', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        timestamps: true,
        underscored: true
    })

    config.getByUid = async function (ctx, uid) {
        let data = await config.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }

    config.search = async (params, models) => {
        let where = { key: { [Op.notLike]: "%version" } }
        let result = await config.findAll({
            where:where,
        })
        return result
    }

    config.getVersions = async (models) => {
        let where = { key: { [Op.like]: "%version" } }
        let result = await config.findAll({
            where: where,
        })
        return result
    }

    config.initVersions = async (models) => {
        let versionsArray = [{
            key: 'android-latest-version', value: '0.0.0'
        },{
            key: 'android-minimum-version', value: '0.0.0'
        },{
            key: 'ios-latest-version', value: '0.0.0'
        },{
            key: 'ios-minimum-version', value: '0.0.0'
        }]
        await config.bulkCreate(versionsArray)
    }

    return config
}
