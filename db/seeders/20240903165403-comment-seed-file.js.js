'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 取出所有餐廳後放進陣列
    const restaurants = await queryInterface.sequelize.query(
      'Select id FROM Restaurants;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    // 取出所有使用者後放進陣列
    const users = await queryInterface.sequelize.query(
      'Select id FROM Users;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    // 用 Array.from() 和 Math.random() 建立 50 組隨機評論
    await queryInterface.bulkInsert('Comments',
      Array.from({ length: 50 }, () => ({
        text: faker.lorem.sentence(),
        user_id: users[Math.floor(Math.random() * 2)].id,
        restaurant_id: restaurants[Math.floor(Math.random() * restaurants.length)].id,
        created_at: new Date(),
        updated_at: new Date()
      }))
    )
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', null)
  }
}
