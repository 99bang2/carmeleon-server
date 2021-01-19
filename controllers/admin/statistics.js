const models = require('../../models')
const response = require('../../libs/response')
const { QueryTypes } = require('sequelize');
const moment = require('moment')

exports.parkingStatistics = async function (ctx) {
	let params = ctx.request.query
	let subQuery = ''
	if(!params.searchYear){
	}
	if(!params.searchMonth){
	}
	if(params.searchParkingSite){
		subQuery = 'AND site_uid='+params.searchParkingSite
	}
	let searchDay = params.searchYear + "-" + params.searchMonth
	let startDate = moment(searchDay).format("YYYY-MM-01");
	let endDate = moment(searchDay).format("YYYY-MM-") + moment().daysInMonth();
	let values = {
		startDate: startDate,
		endDate: endDate
	}
	let query = `
		SELECT * FROM
		(SELECT adddate('1970-01-01',t4*10000 + t3*1000 + t2*100 + t1*10 + t0) selected_date from
		(SELECT 0 t0 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t0,
		(SELECT 0 t1 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t1,
		(SELECT 0 t2 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t2,
		(SELECT 0 t3 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t3,
		(SELECT 0 t4 UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) t4) v
		LEFT JOIN
		(SELECT
		COUNT(CASE WHEN active_status=true  `+subQuery+` THEN 0 END) as complete_count,
		COUNT(CASE WHEN active_status=false  `+subQuery+` THEN 0 END) as non_complete_count,
		DATE_FORMAT(created_at, '%Y-%m-%d') as created_at
		FROM pay_logs GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')) t
		ON v.selected_date = t.created_at
		WHERE selected_date BETWEEN :startDate AND :endDate ORDER BY selected_date`
	// + _.orderBy

	const result = await models.sequelize.query(query,
		{
			replacements: values,
			type: QueryTypes.SELECT,
		}).then(function(data){
		return data
	})
	response.send(ctx, result)
}
