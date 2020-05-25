'use strict'
const Sequelize = require('sequelize')
const moment = require('moment')
module.exports = (sequelize, DataTypes) => {
    const openDoorLog = sequelize.define('openDoorLog', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },
        complexUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },
        doorUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },
    }, {
        timestamps: true,
        underscored: true
    })

    openDoorLog.associate = function (models) {
        openDoorLog.belongsTo(models.user)
        openDoorLog.belongsTo(models.complex)
        openDoorLog.belongsTo(models.door)
    }

    openDoorLog.search = async (params, models) => {
        let where = {}
        if(params.complexUid) {
            where.complexUid = params.complexUid
        }
        if(params.searchConfirmed) {
            where.confirmed = Boolean(params.searchConfirmed === 'true')
        }
        if (params.searchKeyword) {
            where[Sequelize.Op.or] = [
                {
                    userName: {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    userDong: {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    userHo: {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    '$user.phone$': {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                }
            ]
        }
        let order = [['createdAt', 'DESC']]
        if(params.order && params.orderDir) {
            order = [[params.order, params.orderDir]]
        }
        let result = await openDoorLog.findAll({
            order: order,
            where: where,
            include: [{
                model: models.user
            },{
                model: models.complex,
                paranoid: false,
            }]
        })
        let count = await openDoorLog.count({
            where: where,
            include: [{
                model: models.user
            },{
                model: models.complex,
                paranoid: false,
            }]
        })
        return {
            rows: result,
            count: count
        }
    }

    openDoorLog.getByUid = async function (ctx, uid) {
        let data = await openDoorLog.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }

    openDoorLog.getByUserAndComplex = async function (userUid, complexUid) {
        let todayBaseDate = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        let data = await openDoorLog.findOne({
            where: {
                userUid: userUid,
                complexUid: complexUid,
                createdAt: {
                    [Sequelize.Op.gt]: todayBaseDate
                }
            }
        })
        return data
    }

    openDoorLog.searchUserComplex = async (userUid, models) => {
        let todayBaseDate = moment().subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss')
        let result = await openDoorLog.findAll({
            where: {
                userUid: userUid,
                createdAt: {
                    [Sequelize.Op.gt]: todayBaseDate
                }
            },
            include: [{
                model: models.complex,
                paranoid: false,
                include: [{
                    model: models.door,
                }]
            }]
        })
        return result
    }

    return openDoorLog
}