'use strict'
const Promise = require('bluebird')
const bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'))
const response = require('../libs/response')
const Sequelize = require('sequelize')
const codes = require('../configs/codes.json')

module.exports = (sequelize, DataTypes) => {
	const user = sequelize.define('user', {
		uid: {
			type: DataTypes.INTEGER,
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
		},
		id: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		snsType: {
			type: DataTypes.STRING,
		},
		name: {
			type: DataTypes.STRING,
		},
		nickname: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING
		},
		phone: {
			type: DataTypes.STRING
		},
		profileImage: {
			type: DataTypes.STRING
		},
		point: {
			type: DataTypes.INTEGER
		},
		token: {
			type: DataTypes.STRING
		},
		push: {
			type: DataTypes.BOOLEAN
		},
		marketing: {
			type: DataTypes.BOOLEAN
		},
		memo: {
			type: DataTypes.TEXT
		},
		navigationType: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		navigationTypeName: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.getDataValue('navigationType') !== null) {
					return codes.navigationType[this.getDataValue('navigationType')]
				}
			}
		}
		/* 토큰 관련 컬럼 추가 예정*/
	}, {
		indexes: [
			{
				fields: ['created_at']
			}
		],
		timestamps: true,
		paranoid: true,
		underscored: true,
	})

	user.applyScope = function (models) {
		user.addScope('defaultScope', {
			attributes: {exclude: []}
		})
		user.addScope('login', {
			attributes: ['uid', 'id', 'snsType', 'name', 'nickname', 'email', 'phone', 'profileImage', 'navigationType']
		})
	}

	user.getByUid = async function (ctx, uid) {
		let data = await user.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	user.getById = async function (ctx, id) {
		let data = await user.scope('login').findOne({
			where: {
				id: id
			}
		})
		return data
	}

	user.search = async (params) => {
		let where = {}
		let order = [['createdAt', 'DESC']]
		if (params.grade) {
			where.grade = params.grade
		}
		let result = await user.findAll({
			order: order,
			where: where
		})
		return result
	}

	user.getBadge = async function (ctx, uid) {
		let data = await user.findOne({
			attributes:
				[
					//'uid',
					// TODO : payLogs Status에 따라 정리 필요 //
					//주차권
					[Sequelize.literal(`(SELECT count(uid) FROM pay_logs WHERE user_uid=user.uid AND status='10')`), 'ticket'],
					//이용내역
					[Sequelize.literal(`(SELECT count(uid) FROM pay_logs WHERE user_uid=user.uid)`), 'payLog'],
					/////////////////////////////////////////
					// TODO : FCM 추가 필요 //
					// 알림 카운트 //
					/////////////////////////
					//포인트
					[Sequelize.literal(`(SELECT count(uid) FROM coupon_logs WHERE user_uid=user.uid)`), 'coupon'],
					//공지
					[Sequelize.literal(`(SELECT count(uid) FROM notices WHERE created_at > (NOW() - INTERVAL 3 DAY))`), 'notice'],
					//이벤트
					[Sequelize.literal(`(SELECT count(uid) FROM events WHERE created_at > (NOW() - INTERVAL 3 DAY))`), 'event'],
				],
			where: {
				uid: uid
			}
		})
		return data
	}

	return user
}
