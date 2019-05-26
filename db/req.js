// Dependencies
const mysql = require("mysql");



// Set up database connection preferences
const connection = mysql.createConnection({
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'bamazon',
  // Correctly parse DECIMAL values from database
  typeCast: function (field, next) {
    if (field.type === 'NEWDECIMAL') {
      return field.string();
    } else {
      return next();
    }
  }
});



// Get current items from database
function fetchProducts(callback) {
  connection.query(
    'SELECT * FROM products',
    function (err, res) {
      if (err) throw err;
      // Loop through the response and add to the `items` array
      let products = res.map(item => {
        let { item_id, product_name, department_name, price, stock_quantity } = item;
        return { item_id, product_name, department_name, price, stock_quantity };
      });
      // Send the results back via callback
      callback(products);
    }
  )
}



// Get a product by id
function fetchStockQuantityById(id, callback, error) {
  connection.query(
    'SELECT stock_quantity, price FROM products WHERE ?',
    {
      item_id: id
    },
    function (err, res) {
      if (err) throw err;
      // Return an error message if id doesn't exist in database
      if (!res.length) {
        return error('Something went wrong, please re-enter the id');
      }
      // let quantity = res[0].stock_quantity;
      let { stock_quantity, price } = res[0];
      callback(stock_quantity, price);
    }
  )
}



// Send an order request to the database
function order(item_id, quantity) {
  connection.query(
    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE ?',
    [
      quantity,
      {
        item_id
      }
    ],
    function (err, res) {
      if (err) throw err;
    }
  )
}



module.exports = { fetchProducts, order, fetchStockQuantityById };