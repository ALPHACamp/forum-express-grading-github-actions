'use strict'

const { DataTypes } = require('sequelize')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn('Restaurants', 'image', {
      type: DataTypes.STRING
    })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('Restaurants', 'image')
  }
}
