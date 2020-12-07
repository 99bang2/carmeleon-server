'use strict'
const moment = require('moment')
moment.locale('ko')

exports.getOpenTime = async function (discountTicket) {
	let openTime = null
	let openDate = null
	let currentDay = moment().day()
	let currentHHmm =  parseInt(moment().format('HHmm'))
	let isWeekend = (currentDay === 0 || currentDay === 6)
	let sellingStartTime = discountTicket.sellingStartTime ? parseInt(discountTicket.sellingStartTime) : null

	// 요일 제한 체크
	let isRightDay = true
	let addDay = 0

	if(discountTicket.ticketDayType === 1) {

		if(isWeekend) {
			isRightDay = false
			addDay = ( 7 - currentDay + 1 ) % 7
		}
	}else if(discountTicket.ticketDayType === 2) {
		if(!isWeekend) {
			isRightDay = false
			addDay = ( 7 - currentDay + 6 ) % 7
		}
	}else if(discountTicket.ticketDayType === 4) {
		if(currentDay !== 5) {
			isRightDay = false
			addDay = ( 7 - currentDay + 5 ) % 7
		}
	}else if(discountTicket.ticketDayType === 5) {
		if(currentDay !== 6) {
			isRightDay = false
			addDay = ( 7 - currentDay + 6 ) % 7
		}
	}else if(discountTicket.ticketDayType === 6) {
		if(currentDay !== 0) {
			isRightDay = false
			addDay = ( 7 - currentDay ) % 7
		}
	}

	if(isRightDay) {
		if(sellingStartTime) {
			if(currentHHmm < sellingStartTime) {
				openDate = currentHHmm < sellingStartTime ? moment() : moment().add(1, 'd')
				openTime = `${openDate.format('M/D(ddd)')} ${discountTicket.sellingStartTimeHour}:${discountTicket.sellingStartTimeMinute}`
			}
		}
	}else {
		openDate = moment().add(addDay, 'd')
		if(sellingStartTime) {
			openTime = `${openDate.format('M/D(ddd)')} ${discountTicket.sellingStartTimeHour}:${discountTicket.sellingStartTimeMinute}`
		}else {
			openTime = `${openDate.format('M/D(ddd)')} 00:00`
		}
	}

	return openTime
}
