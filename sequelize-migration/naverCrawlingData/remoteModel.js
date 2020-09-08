'use strict'
const path = require('path')
const Sequelize = require('sequelize')
const db = {}

let sequelize
sequelize = new Sequelize('carmeleon-db', 'carmeleon', 'thwlsWkd123', {
    host: '49.50.172.248',
    dialect: 'mysql',
    timezone: '+09:00',
})
sequelize
    .authenticate()
    .then(() => {
        console.log('data(mysql) server connection success')
    })
    .catch((err) => {
        console.log(err)
    })
const model = sequelize['import'](path.join(__dirname, 'parkingSite'))
db[model.name] = model
db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db
