'use strict'
const codes = require('../configs/codes.json')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

module.exports = (sequelize, DataTypes) => {
    const parkingSite = sequelize.define('parkingSite', {
        uid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        siteType: {
            type: DataTypes.INTEGER
        },
        siteTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('siteType') !== null) {
                    return codes.site[this.getDataValue('siteType')]
                }
            }
        },
        lat: {
            type: DataTypes.DOUBLE
        },
        lon: {
            type: DataTypes.DOUBLE
        },
        parkingLot: {
            type: DataTypes.INTEGER
        },
        tel: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        manager: {
            type: DataTypes.STRING
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        paymentTag: {
            type: DataTypes.JSON
        },
        paymentTagName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('paymentTag') !== null) {
                    return this.getDataValue('paymentTag').map(function (obj) {
                        return codes.paymentTag[obj]
                    })
                }
            }
        },
        brandTag: {
            type: DataTypes.JSON
        },
        brandTagName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('brandTag') !== null) {
                    return this.getDataValue('brandTag').map(function (obj) {
                        return codes.brandTag[obj]
                    })
                }
            }
        },
        productTag: {
            type: DataTypes.JSON
        },
        productTagName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('productTag') !== null) {
                    return this.getDataValue('productTag').map(function (obj) {
                        return codes.productTag[obj]
                    })
                }
            }
        },
        optionTag: {
            type: DataTypes.JSON
        },
        optionTagName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('optionTag') !== null) {
                    return this.getDataValue('optionTag').map(function (obj) {
                        return codes.optionTag[obj]
                    })
                }
            }
        },
        carTag: {
            type: DataTypes.JSON
        },
        carTagName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('carTag') !== null) {
                    return this.getDataValue('carTag').map(function (obj) {
                        return codes.carTag[obj]
                    })
                }
            }
        },
        price: {
            type: DataTypes.INTEGER
        },
        rate: {
            type: DataTypes.DOUBLE
        },
        address: {
            type: DataTypes.STRING
        },
        info: {
            type: DataTypes.TEXT
        },
        priceInfo: {
            type: DataTypes.TEXT
        },
        timeInfo: {
            type: DataTypes.TEXT
        },
        picture: {
            type: DataTypes.JSON
        },
        operationTime: {
            type: DataTypes.STRING
        },
        accountUid: {
            type: DataTypes.INTEGER
        },
        valetType: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        valetTypeName: {
            type: DataTypes.VIRTUAL,
            get: function () {
                if (this.getDataValue('valetType') !== null) {
                    return codes.valetType[this.getDataValue('valetType')]
                }
            }
        },
        isRecommend: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isBuy: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isRate: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        message: {
            type: DataTypes.TEXT
        },
        targetType: {
            type: DataTypes.VIRTUAL,
            get: function () {
                return 0
            }
        },
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
    })
    parkingSite.associate = function (models) {
        //parkingSite.hasMany(models.rating, {foreignKey: 'site_uid'})
        parkingSite.hasMany(models.rating, {
            foreignKey: 'targetUid',
            constraints: false,
            scope: {
                targetType: 0
            }
        })
        parkingSite.hasMany(models.favorite, {
            foreignKey: 'targetUid',
            constraints: false,
            scope: {
                targetType: 0
            }
        })
        parkingSite.hasMany(models.discountTicket, {
            foreignKey: 'siteUid',
            sourceKey: 'uid'
        })
    }

    //어드민 검색용
    parkingSite.search = async (params, models) => {
        let where = {}
        let order = [['createdAt', 'DESC']]

        if (params.searchSiteType) {
            where.siteType = params.searchSiteType
        }
        if (params.searchActive) {
            where.isActive = params.searchActive === 'true' ? 1 : 0
        }
        if (params.searchRating) {
            let start = parseInt(params.searchRating.split(";")[0])
            let end = parseInt(params.searchRating.split(";")[1])
            if (start === 0) {
                where.rate = {
                    [Sequelize.Op.or]: [{
                        [Sequelize.Op.is]: null
                    }, {
                        [Sequelize.Op.between]: [start, end]
                    }]
                }
            } else {
                where.rate = {[Sequelize.Op.between]: [start, end]}
            }
        }
        if (params.searchKeyword) {
            let searchObj = {
                [Op.or]: [
                    {name: {[Sequelize.Op.like]: '%' + params.searchKeyword + '%'}},
                    {address: {[Sequelize.Op.like]: '%' + params.searchKeyword + '%'}}
                ]
            }
            Object.assign(where, searchObj)
        }
        let result = await parkingSite.findAll({
            offset: params.offset ? Number(params.offset) : null,
            limit: params.limit ? Number(params.limit) : null,
            order: order,
            where: where
        })
        let count = await parkingSite.scope(null).count({
            where: where
        })
        return {
            rows: result,
            count: count
        }
    }

    parkingSite.findRange = async (params, models) => {
        console.log(params)
        let where = []
        let distanceQuery = models.sequelize.where(models.sequelize.literal(`(6371 * acos(cos(radians(${params.lat})) * cos(radians(lat)) * cos(radians(lon) - radians(${params.lon})) + sin(radians(${params.lat})) * sin(radians(lat))))`), '<=', 0.3)
        where.push(distanceQuery)

        let result =  await parkingSite.findAll({where:where})
        return result
    }
    return parkingSite
}
