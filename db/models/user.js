'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      User.hasMany(models.Comment, { foreignKey: 'userId' })
      User.belongsToMany(models.Restaurant, {
        through: models.Favorite, // 透過 Favorite 表來建立關聯
        as: 'FavoritedRestaurants', // 幫這個關聯取個名稱
        foreignKey: 'userId' // 對 Favorite 表設定 FK
      })
      User.belongsToMany(models.Restaurant, {
        through: models.Like, // 透過 Favorite 表來建立關聯
        as: 'LikeRestaurants', // 幫這個關聯取個名稱
        foreignKey: 'userId' // 對 Favorite 表設定 FK
      })
      User.belongsToMany(models.User, {
        through: models.Followship,
        as: 'Followings',
        foreignKey: 'followerId'
      })
      User.belongsToMany(models.User, {
        through: models.Followship,
        as: 'Followers',
        foreignKey: 'followingId'
      })
    }
  };
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isAdmin: DataTypes.BOOLEAN,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    underscored: true
  })
  return User
}
