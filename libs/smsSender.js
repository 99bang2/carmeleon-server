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

exports.sendSMS = async (content, phone) => {
	const connection = await pool.getConnection(async conn => conn)
	let sendData = {
		TR_PHONE: phone,
		TR_CALLBACK: SEND_NUMBER,
		TR_SENDDATE: new Date(),
		TR_MSG: content
	}
	let result = await connection.query('INSERT INTO SC_TRAN SET ?', sendData)
	connection.release()
	return result
}