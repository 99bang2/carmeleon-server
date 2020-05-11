'use strict'

module.exports = {
    up: (queryInterface, Sequelize) => {
        let migrations = []
        migrations.push(queryInterface.addColumn(
            'doors',
            'rssi_open',
            {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: -50,
                after: 'key_open_door'
            }
        ))
        migrations.push(queryInterface.addColumn(
            'doors',
            'ble_name',
            {
                type: Sequelize.STRING,
                allowNull: true,
                after: 'name'
            }
        ))
        return Promise.all(migrations)
    },

    down: (queryInterface, Sequelize) => {
        let migrations = []
        migrations.push(queryInterface.removeColumn('doors', 'rssi_open'))
        migrations.push(queryInterface.removeColumn('doors', 'ble_name'))
        return Promise.all(migrations)
    }
}
