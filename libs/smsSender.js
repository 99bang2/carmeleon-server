'use strict'
const mysql = require('mysql2/promise')
let pool = mysql.createPool({
	host: '1.234.4.99',
	port: 23306,
	user: 'neptune',
	password: 'thwlsWkd123',
	database: 'sms'
})
let SEND_NUMBER = '0316049907'

exports.sendSMS = async (title, content, phone) => {
	const connection = await pool.getConnection(async conn => conn)
	let sendData = {
		SUBJECT: title,
		PHONE: phone,
		CALLBACK: SEND_NUMBER,
		STATUS: 0,
		REQDATE: new Date(),
		MSG: content
	}
	let result = await connection.query('INSERT INTO MMS_MSG SET ?', sendData)
	connection.release()
	return result
}