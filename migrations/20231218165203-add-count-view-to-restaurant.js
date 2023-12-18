'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('restaurants', 'count_view', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('restaurants', 'count_view')
  }
}
