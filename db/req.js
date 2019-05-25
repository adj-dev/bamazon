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



// Connect to the database
function connect() {
  connection.connect(function (err) {
    if (err) throw err;
  });
}



// Disconnect from the database
function disconnect() {
  connection.end();
}



// Get current items from database
function fetchProducts(callback) {
  connect();
  connection.query(
    'SELECT * FROM products',
    function (err, res) {
      if (err) throw err;
      // Loop through the response and add to the `items` array
      let products = res.map(item => {
        let { item_id, product_name, department_name, price, stock_quantity } = item;
        return { item_id, product_name, department_name, price, stock_quantity };
      });
      disconnect();
      // Send the results back via callback
      callback(products);
    }
  )
}



module.exports = { fetchProducts };