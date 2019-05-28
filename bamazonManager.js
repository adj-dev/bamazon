// Dependencies
const inquirer = require("inquirer");
const Table = require("cli-table");
const database = require("./db/req.js");



// Shows the main menu
function mainMenu() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'Please choose from one of the options below:',
        choices: [
          'View products for sale',
          'View low inventory',
          'Add to inventory',
          'Add new product'
        ]
      }
    ])
    .then(answer => {
      let { choice } = answer;

      switch (choice) {
        case 'View products for sale':
          viewProducts();
          break;
        case 'View low inventory':
          viewLowInventory();
          break;
        case 'Add to inventory':
          addInventory();
          break;
        case 'Add new product':
          addProduct();
          break;
        default:
          console.log('error');
          return;
      }
    })
    .catch(err => {
      if (err) throw err;
    })
}



// Shows all products currently for sale
function viewProducts() {
  // Fetch all available products from the database and handle the response with a callback
  database.fetchProducts(products => {
    // Generate a table and console.log it
    generateFullTable(products);
    // Show the main menu
    mainMenu();
  });
}



// Show all the low inventory items (less than 5 qty in stock)
function viewLowInventory() {
  database.fetchLowInventory(products => {
    // Generate a table and console.log it
    generateFullTable(products);
    // Show the main menu
    mainMenu();
  })
}



// Allows the manager to add to the inventory
function addInventory() {
  // First, display all the products
  database.fetchProducts(products => {
    generateFullTable(products);
    // Call a function that prompts the manager which item and how much inventory to add
    promptInventory();
  })
}



// Prompts manager for item id and quantity of inventory to add
function promptInventory() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Enter the ID of the product you want to add to inventory'
      },
      {
        type: 'input',
        name: 'quantity',
        message: 'Enter the quantity to add to inventory'
      }
    ])
    .then(answer => {
      let { id, quantity } = answer;

      // Validate the id
      if (id <= 0 || id.includes('.') || !parseInt(id)) {
        console.log(`\n\nNot a valid product id\n\n`);
        return promptInventory();
      }

      // Validate the quantity
      if (quantity <= 0 || quantity.includes('.') || !parseInt(quantity)) {
        console.log(`\n\nNot a valid quantity\n\n`);
        return promptInventory();
      }

      // Check if the id exists in the database
      database.checkId(id, error => {
        if (error) {
          console.log(`\n\n${error}\n\n`);
          return promptInventory();
        }

        // Otherwise, add to the inventory if the id exists
        database.addInventory(id, quantity);

        // Show the products so manager can confirm changes
        viewProducts();
      });
    })
    .catch(err => {
      if (err) throw err;
    })
}



// Allow a manager to add a product
function addProduct() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'productName',
        message: 'Enter the product name:'
      },
      {
        type: 'input',
        name: 'price',
        message: 'Enter the product price:'
      },
      {
        type: 'list',
        name: 'department',
        message: 'Select a department:',
        choices: [
          'Apparel',
          'Kitchen/Appliances',
          'Electronics',
          'Decor',
          'Sporting Goods',
          'Books',
          'Misc'
        ]
      },
      {
        type: 'input',
        name: 'quantity',
        message: 'Enter an initial In-Stock quantity:'
      }
    ])
    .then(answer => {
      let { productName, price, department, quantity } = answer;

      database.addProduct(productName, price, department, quantity, function () {
        viewProducts();
      });
    })
    .catch(err => {
      if (err) throw err;
    });
}



// Generates a table (helper function)
function generateFullTable(products) {
  // Instantiate a new cli-table
  let table = new Table({
    head: ['ID', 'Product Name', 'Department', 'Price', 'Qty In-Stock']
  });

  // Iterate through each product and push relevant data to the table array
  products.forEach(product => {
    let { item_id, product_name, price, department_name, stock_quantity } = product;
    table.push([item_id, product_name, department_name, `$${price}`, stock_quantity]);
  });

  // Display the table
  console.log(table.toString());
}



// Show the main menu when app is first run
mainMenu();