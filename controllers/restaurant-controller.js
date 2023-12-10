const restaurantController = {
  getRestaurants: (req, res) => {
    console.log('asd')
    return res.render('restaurants')
  }
}

module.exports = restaurantController
