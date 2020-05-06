'use strict'
const Sequelize = require('sequelize')
module.exports = (sequelize, DataTypes) => {
    const userComplex = sequelize.define('userComplex', {
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
        userName: {
            type: DataTypes.STRING,
        },
        userDong: {
            type: DataTypes.STRING,
        },
        userHo: {
            type: DataTypes.STRING,
        },
        confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        doors: {
            type: DataTypes.JSON
        }
    }, {
        timestamps: true,
        underscored: true
    })

    userComplex.associate = function (models) {
        userComplex.belongsTo(models.user)
        userComplex.belongsTo(models.complex)
    }

    userComplex.search = async (params, models) => {
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
        let result = await userComplex.findAll({
            order: order,
            where: where,
            include: [{
                model: models.user
            },{
                model: models.complex
            }]
        })
        let count = await userComplex.count({
            where: where,
            include: [{
                model: models.user
            },{
                model: models.complex
            }]
        })
        return {
            rows: result,
            count: count
        }
    }

    userComplex.getByUid = async function (ctx, uid) {
        let data = await userComplex.findByPk(uid)
        if (!data) {
            response.badRequest(ctx)
        }
        return data
    }

    userComplex.getByUserAndComplex = async function (userUid, complexUid) {
        let data = await userComplex.findOne({
            where: {
                userUid: userUid,
                complexUid: complexUid
            }
        })
        return data
    }

    return userComplex
}