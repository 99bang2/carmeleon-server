'use strict'
module.exports = (sequelize, DataTypes) => {
	const userRefreshToken = sequelize.define('userRefreshToken', {
		userUuid: {
			type: DataTypes.UUID,
			unique: true,
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	}, {
		timestamps: true,
		underscored: true,
	})
	return userRefreshToken
}
