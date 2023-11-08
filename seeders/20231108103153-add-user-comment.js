'use strict'
const faker = require('faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const restaurants = await queryInterface.sequelize.query( // query與法會返回一個查詢array object如 [{  }, {  },...等]
      'SELECT id FROM Restaurants ORDER BY id ASC LIMIT 5;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    const user = await queryInterface.sequelize.query( // 設置id排序為1的使用者
      'SELECT id FROM Users LIMIT 1;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    for (let i = 0; i < 5; i++) {
      await queryInterface.bulkInsert('Comments', [{
        text: faker.lorem.word(10),
        user_id: user[0].id,
        restaurant_id: restaurants[i].id,
        created_at: new Date(),
        updated_at: new Date()
      }]
      )
    }
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Comments', {})
  }
}
