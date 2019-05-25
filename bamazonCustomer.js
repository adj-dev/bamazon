// Dependencies
const inquirer = require("inquirer");
const Table = require("cli-table");
const database = require("./db/req.js");



// Display all products for sale
function showCatalog() {
  // Fetch all available products from the database and handle the response with a callback
  database.fetchProducts(products => {
    // Instantiate a new cli-table
    let table = new Table({
      head: ['ID', 'Product Name', 'Price']
    });

    // Iterate through each product and push relevant to the table array
    products.forEach(product => {
      let { item_id, product_name, price } = product;
      table.push([item_id, product_name, `$${price}`]);
    });

    // Display the table
    console.log(table.toString());

    // Prompt the user for input
    promptCustomer();
  });
}



// Prompt user for id of product
function promptCustomer() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'id',
        message: "Enter the ID of the product you'd like to buy"
      }
    ])
    .then(answer => {
      let { id } = answer;

      console.log(id);
    })
    .catch(err => {
      if (err) throw err;
    });
}

showCatalog();

