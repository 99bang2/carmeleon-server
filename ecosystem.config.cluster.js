module.exports = {
	apps: [{
		name: 'CARMELEON-SERVER',
		script: 'index.js',
		watch: false,
		instance: 'max',
		exec_mode: 'cluster',
		ignore_watch: ['node_modules', '*.log', 'package.json', 'package-lock.json', '.idea', '.git'],
		env: {
			NODE_ENV: 'development',
			TZ: 'Asia/Seoul'
		},
		env_production: {
			NODE_ENV: 'production',
			TZ: 'Asia/Seoul'
		},
		env_test: {
			NODE_ENV: 'test',
			TZ: 'Asia/Seoul'
		},
		node_args: '--max-old-space-size=8192',
		log_date_format: 'YYYY-MM-DD HH:mm:ss',
		error_file: 'logs/err.log',
		out_file: 'logs/out.log',
		merge_logs: true,
	}]
};
