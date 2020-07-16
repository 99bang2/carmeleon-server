# API 서버

- Nodejs 12.14.1
- Koa
- Mysql 5.7.21


## 개발 환경 및 새 프로젝트 세팅
- package.json : name, description, scripts 수정
- ecosystem.config.js : name 등 수정 
- configs/config.json, configs/sequelize.json : db, redis 수정
- docker-compose.db.yml : db 환경 설정 및 docker로 db서버 올려서 사용/