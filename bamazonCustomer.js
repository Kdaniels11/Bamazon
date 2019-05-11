var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "",
  password: "",
  database: "bamazon"
});

function start() {
  connection.query("SELECT * FROM products", function(error, results) {
    if (error) throw error;
    console.table(results);
    inquirer
      .prompt([
        {
          type: "input",
          name: "item_id",
          message: "What would you like to buy?"
        },
        {
          type: "input",
          name: "quantity",
          message: "How many of this item do you want?"
        }
      ])
      .then(answers => {
        connection.query(
          `SELECT stock_quantity FROM products WHERE item_id = ${
            answers.item_id
          };`,
          function(error, results) {
            if (error) throw error;
            var isValidAmount =
              parseInt(answers.quantity) <= parseInt(results[0].stock_quantity)
                ? true
                : false;

            if (isValidAmount) {
              order(answers, results[0].stock_quantity);
            } else {
              console.log("Looks like we're out of stock. GET OUT!");
              connection.end();
            }
          }
        );
      });
  });
}

function order(answers, current_quantity) {
    var new_quantity = parseInt(current_quantity) - parseInt(answers.quantity);
    connection.query(`UPDATE products SET ? WHERE item_id = ${answers.item_id};`,
    [
        {
            stock_quantity: new_quantity
        }
    ],
    function (error, results,) {
        if (error) throw error;
        connection.query(`SELECT price FROM products WHERE item_id = ${answers.item_id}`, function (error, results) {
            if (error) throw error;
            var cost = parseFloat(results[0].price) * parseFloat(answers.quantity)
            console.log("Total Purchase Price: $" + parseFloat(cost).toFixed(2));
            connection.end();
        });    });
}

start();
