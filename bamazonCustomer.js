// Dependencies
const inquirer = require("inquirer");
const Table = require("cli-table");
const database = require("./db/req.js");



// Helper function for calculating total cost
function totalCost(price, quantity) {
  return `$${price * quantity}`
}



// Display all products for sale
function showCatalog() {
  // Fetch all available products from the database and handle the response with a callback
  database.fetchProducts(products => {
    // Instantiate a new cli-table
    let table = new Table({
      head: ['ID', 'Product Name', 'Department', 'Price', 'Stock Quantity']
    });

    // Iterate through each product and push relevant to the table array
    products.forEach(product => {
      let { item_id, product_name, department_name, price, stock_quantity } = product;
      table.push([item_id, product_name, department_name, `$${price}`, stock_quantity]);
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
        message: "Enter the ID of the product you'd like to buy:"
      },
      {
        type: 'input',
        name: 'quantity',
        message: 'Enter quantity: '
      }
    ])
    .then(answer => {
      let { id, quantity } = answer;

      // Validate the id
      if (id <= 0 || id.includes('.') || !parseInt(id)) {
        console.log(`\n\nNot a valid product id\n\n`);
        return promptCustomer();
      }

      // Validate the quantity
      if (quantity <= 0 || quantity.includes('.') || !parseInt(quantity)) {
        console.log(`\n\nNot a valid quantity\n\n`);
        return promptCustomer();
      }

      // Check the desired quantity against the in-stock quantity
      // `fetchStockQuantityById` gets the in-stock quantity of a product and handles the response with a callback
      // and also sends back a cost to be handled by an in-house helper function
      database.fetchStockQuantityById(id, (inStock, price) => {
        if (quantity > inStock) {
          console.log(`\n\nSorry, insufficient quantity!\n\n`);
          promptCustomer();
        } else {
          database.order(id, quantity);
          console.log(`\n\nTotal: ${totalCost(price, quantity)}\n\n`);
          promptPurchase();
        }
      }, err => { // Error handler specifically for id's that don't exist in the database
        console.log(`\n\n${err}\n\n`);
        promptCustomer();
      });
    })
    .catch(err => {
      if (err) throw err;
    });
}



function promptPurchase() {
  inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Complete Purchase?',
        default: true
      }
    ])
    .then(answer => {
      let { confirm } = answer;

      if (confirm) {
        console.log(`\n\nThank you for your purchase!\n\n`);
        showCatalog();
      }
    })
}
showCatalog();

