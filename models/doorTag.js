'use strict'
module.exports = (sequelize, DataTypes) => {
    const doorTag = sequelize.define('doorTag', {
        doorUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },
        tagUid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            index: true
        },
    }, {
        timestamps: false,
        underscored: true
    })
    return doorTag
}