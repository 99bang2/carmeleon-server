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
        if(params.searchDate) {
            if(params.searchDate.split('~').length > 1) {
                where.createdAt = {
                    [Sequelize.Op.between]: [
                        moment(params.searchDate.split(' ~ ')[0]).format('YYYY-MM-DD'),
                        moment(params.searchDate.split(' ~ ')[1]).add(1, 'days').format('YYYY-MM-DD')
                    ]
                }
            }else {
                where.createdAt = {
                    [Sequelize.Op.between]: [
                        moment(params.searchDate).format('YYYY-MM-DD'),
                        moment(params.searchDate).add(1, 'days').format('YYYY-MM-DD')
                    ]
                }
            }
        }
        if (params.searchKeyword) {
            where[Sequelize.Op.or] = [
                {
                    '$user.name$': {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    '$user.phone$': {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    '$complex.name$': {
                        [Sequelize.Op.like]: '%' + params.searchKeyword + '%'
                    }
                },
                {
                    '$complex.full_address$': {
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
            offset: params.offset ? Number(params.offset) : 0,
            limit: params.limit ? Number(params.limit) : 10,
            include: [{
                model: models.user
            },{
                model: models.door
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
                model: models.door
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


    return openDoorLog
}