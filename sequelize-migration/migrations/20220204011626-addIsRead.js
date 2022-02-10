'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('pay_logs', 'is_read', {
                type: Sequelize.BOOLEAN
            })
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async(queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('pay_logs', 'is_read')
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }
};
