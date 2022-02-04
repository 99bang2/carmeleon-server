'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('parking_sites', 'auto_pass_code', {
                type: Sequelize.STRING
            })
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    },

    down: async(queryInterface, Sequelize) => {
        try {
            await queryInterface.removeColumn('parking_sites', 'auto_pass_code')
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }
};
