// Importing dependencies
const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');

require('dotenv').config()

// Connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'employee_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('\n EMPLOYEE TRACKER \n');
  mainPage();
});

// Prompt of the main page using inquirer
const mainPage = () => {
  inquirer.prompt([{

    name: 'choices',
    type: 'list',
    message: 'Choose what would you like to do:',
    choices: ['View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Update an employee manager',
      "View employees by department",
      'Delete a department',
      'Delete a role',
      'Delete an employee',
      'View department budgets',
      'No Action']

  }])

    // Switch case for different actions
    .then((answers) => {

      switch (answers.choices) {
        case "View all departments":
          viewDepartments();
          break;

        case "View all roles":
          viewRoles();
          break;

        case "View all employees":
          viewEmployees();;
          break;

        case "Add a department":
          addDepartment();
          break;

        case "Add a role":
          addRole();
          break;

        case "Add an employee":
          addEmployee();
          break;

        case "Update an employee role":
          updateEmpRole();
          break;

        case "Update an employee manager":
          updateEmpManager();
          break;

        case "View employees by department":
          employeeDepartment();
          break;

        case "Delete a department":
          deleteDepartment();
          break;

        case "Delete a role":
          deleteRole();
          break;

        case "Delete an employee":
          deleteEmployee();
          break;

        case "View department budgets":
          viewBudget();
          break;

        case "No Action":
          db.end();
          break;
      }
    });
};

// Showing all departments 
viewDepartments = () => {
  console.log('Showing all departments:\n');
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainPage();
  });
};

// Showing all roles 
viewRoles = () => {
  console.log('Showing all roles:\n');

  const sql = `SELECT role.id, role.title, department.name AS department
               FROM role
               INNER JOIN department ON role.department_id = department.id`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainPage();
  })
};

// Showing all employees 
viewEmployees = () => {
  console.log('Showing all employees:\n');
  const sql = `SELECT employee.id, 
                      employee.first_name, 
                      employee.last_name, 
                      role.title, 
                      department.name AS department,
                      role.salary, 
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
                      FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  db.query(sql, (err, rows) => {
    if (err) throw err
    console.table(rows);
    mainPage();
  });
};

// Add a department 
addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'addDepartment',
      message: "What department do you want to add?",
      validate: addDepartment => {
        if (addDepartment) {
          return true;
        } 
        console.log('Please enter a department');
        return false;
      }
    }
  ])
    .then(answer => {
      const sql = `INSERT INTO department (name)
                  VALUES (?)`;
      db.query(sql, answer.addDepartment, (err, result) => {
        if (err) throw err;
        console.log('Added ' + answer.addDepartment + " to departments!");

        viewDepartments();
      });
    });
};

// Add a role 
addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'role',
      message: "What role do you want to add?",
      validate: addRole => {
        if (addRole) {
          return true;
        } 
        console.log('Please enter a role');
        return false;
      }
    },
    {
      type: 'input',
      name: 'salary',
      message: "What is the salary of this role?",
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary];

      const roleSql = `SELECT name, id FROM department`;

      db.query(roleSql, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer.prompt([
          {
            type: 'list',
            name: 'dept',
            message: "What department is this role in?",
            choices: dept
          }
        ])
          .then(deptChoice => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`;

            db.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log('Added' + answer.role + " to roles!");

              viewRoles();
            });
          });
      });
    });
};

// Add an employee 
addEmployee = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'fistName',
      message: "What is the employee first name?",
      validate: addFirstName => {
        if (addFirstName) {
          return true;
        } else {
          console.log('Please enter a first name');
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: "What is the employee last name?",
      validate: addLastName => {
        if (addLastName) {
          return true;
        } else {
          console.log('Please enter a last name');
          return false;
        }
      }
    }
  ])
    .then(answer => {
      const params = [answer.fistName, answer.lastName]

      const roleSql = `SELECT role.id, role.title FROM role`;

      db.query(roleSql, (err, data) => {
        if (err) throw err;

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: "What is the employee role?",
            choices: roles
          }
        ])
          .then(roleChoice => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = `SELECT * FROM employee`;

            db.query(managerSql, (err, data) => {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

              inquirer.prompt([
                {
                  type: 'list',
                  name: 'manager',
                  message: "Who is the employee manager?",
                  choices: managers
                }
              ])
                .then(managerChoice => {
                  const manager = managerChoice.manager;
                  params.push(manager);

                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                  db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added!")

                    viewEmployees();
                  });
                });
            });
          });
      });
    });
};

// Update an employee 
updateEmpRole = () => {
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
      .then(employeeChoice => {
        const employee = employeeChoice.name;
        const params = [];
        params.push(employee);

        const roleSql = `SELECT * FROM role`;

        db.query(roleSql, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, title }) => ({ name: title, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'role',
              message: "What is the employee's new role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role;
              params.push(role);

              let employee = params[0]
              params[0] = role
              params[1] = employee

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

              db.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                viewEmployees();
              });
            });
        });
      });
  });
};

// Update an employee 
updateEmpManager = () => {
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to update?",
        choices: employees
      }
    ])
      .then(employeeChoice => {
        const employee = employeeChoice.name;
        const params = [];
        params.push(employee);

        const managerSql = `SELECT * FROM employee`;

        db.query(managerSql, (err, data) => {
          if (err) throw err;

          const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              name: 'manager',
              message: "Who is the employee's manager?",
              choices: managers
            }
          ])
            .then(managerChoice => {
              const manager = managerChoice.manager;
              params.push(manager);

              let employee = params[0]
              params[0] = manager
              params[1] = employee

              const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

              db.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                viewEmployees();
              });
            });
        });
      });
  });
};

// Employee by department
employeeDepartment = () => {
  console.log('Employee by departments:\n');
  const sql = `SELECT employee.first_name, 
                      employee.last_name, 
                      department.name AS department
               FROM employee 
               LEFT JOIN role ON employee.role_id = role.id 
               LEFT JOIN department ON role.department_id = department.id`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    mainPage();
  });
};

// Delete department
deleteDepartment = () => {
  const deptSql = `SELECT * FROM department`;

  db.query(deptSql, (err, data) => {
    if (err) throw err;

    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'dept',
        message: "What department do you want to delete?",
        choices: dept
      }
    ])
      .then(deptChoice => {
        const dept = deptChoice.dept;
        const sql = `DELETE FROM department WHERE id = ?`;

        db.query(sql, dept, (err, result) => {
          if (err) throw err;
          console.log("Successfully deleted!");

          viewDepartments();
        });
      });
  });
};

// Delete role
deleteRole = () => {
  const roleSql = `SELECT * FROM role`;

  db.query(roleSql, (err, data) => {
    if (err) throw err;

    const role = data.map(({ title, id }) => ({ name: title, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'role',
        message: "What role do you want to delete?",
        choices: role
      }
    ])
      .then(roleChoice => {
        const role = roleChoice.role;
        const sql = `DELETE FROM role WHERE id = ?`;

        db.query(sql, role, (err, result) => {
          if (err) throw err;
          console.log("Successfully deleted!");

          viewRoles();
        });
      });
  });
};

// Delete employees
deleteEmployee = () => {
  const employeeSql = `SELECT * FROM employee`;

  db.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: "Which employee would you like to delete?",
        choices: employees
      }
    ])
      .then(employeeChoice => {
        const employee = employeeChoice.name;

        const sql = `DELETE FROM employee WHERE id = ?`;

        db.query(sql, employee, (err, result) => {
          if (err) throw err;
          console.log("Successfully Deleted!");

          viewEmployees();
        });
      });
  });
};

// Department budget 
viewBudget = () => {
  console.log('Department Budget:\n');

  const sql = `SELECT department_id AS id, 
                      department.name AS department,
                      SUM(salary) AS budget
               FROM  role  
               JOIN department ON role.department_id = department.id GROUP BY  department_id`;

  db.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);

    mainPage();
  });
};