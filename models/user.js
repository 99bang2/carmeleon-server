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
		uuid: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			unique: true,
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
		newMessage: {
			type: DataTypes.DATE,
			defaultValue: null
		},
		marketing: {
			type: DataTypes.BOOLEAN
		},
		coopPayment: {
			type: DataTypes.INTEGER.UNSIGNED,
			defaultValue: 0
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
		},
        /*자동정산 표시 플래그*/
        isAutoPass : {
            type: DataTypes.BOOLEAN,
        }
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
			attributes: ['uid', 'uuid', 'id', 'snsType', 'name', 'nickname', 'email', 'phone', 'profileImage', 'navigationType' ,'marketing']
		})
	}
    user.associate = function (models) {
        user.hasMany(models.car)
        user.hasMany(models.card)
    }

	user.getByUid = async function (ctx, uid) {
		let data = await user.findByPk(uid)
		if (!data) {
			response.badRequest(ctx)
		}
		return data
	}

	user.getByUUID = async function (uuid) {
		let data = await user.scope('login').findOne({
			where: {
				uuid: uuid
			}
		})
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

		let result = await user.findAll({
			order: order,
			where: where
		})
		return result
	}

	//사용안함
	user.getBadge = async function (ctx, uid) {
		let data = await user.findOne({
			attributes:
				[
					// TODO : payLogs Status에 따라 정리 필요 //
					//주차권 (사용 가능한 주차권 모두)
					[Sequelize.literal(`(SELECT count(uid) FROM pay_logs WHERE user_uid=user.uid AND status='10' AND active_status = false AND expired = false AND deleted_at IS NULL)`), 'ticket'],
					//이용내역 (여태 이용한 리스트 모두)
					[Sequelize.literal(`(SELECT count(uid) FROM pay_logs WHERE user_uid=user.uid AND deleted_at IS NULL)`), 'payLog'],
					// 알림 카운트 //
					[Sequelize.literal(`(SELECT count(uid) FROM pushes WHERE send_date > (NOW() - INTERVAL 1 DAY) AND (user_uid = ${ctx.user.uid} OR user_uid IS NULL) AND deleted_at IS NULL)`), 'alarm'],
					//포인트
					[Sequelize.literal(`(SELECT count(uid) FROM coupon_logs WHERE user_uid=user.uid AND deleted_at IS NULL)`), 'coupon'],
					//공지
					[Sequelize.literal(`(SELECT count(uid) FROM notices WHERE created_at > (NOW() - INTERVAL 3 DAY) AND deleted_at IS NULL)`), 'notice'],
					//이벤트
					[Sequelize.literal(`(SELECT count(uid) FROM events WHERE created_at > (NOW() - INTERVAL 3 DAY) AND deleted_at IS NULL)`), 'event'],
				],
			where: {
				uid: uid
			}
		})
		return data
	}

	user.getUserPoint = function (uid) {
		return user.findOne(
			{
				attributes: ['point'],
				where: {
					uid: uid
				}
			}
		)
	}

	return user
}
