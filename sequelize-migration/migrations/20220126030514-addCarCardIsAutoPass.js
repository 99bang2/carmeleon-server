'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('cars', 'is_auto_pass', {
                type: Sequelize.BOOLEAN
            })
            await queryInterface.addColumn('cards', 'is_auto_pass', {
                type: Sequelize.BOOLEAN
            })
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async(queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('cars', 'is_auto_pass')
            await queryInterface.removeColumn('cards', 'is_auto_pass')
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }
};
