import inquirer from 'inquirer';
import ORM from './orm.js';

const orm = new ORM();
await orm.connect();

function renderMenu(): void {
    inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: [
            'View departments',
            'View roles',
            'View all employees',
            "View employees by manager",
            "View employees by department",
            "Add department",
            "Add role",
            "Add employee",
            "Update employee role",
            "Update employee manager",
            "Delete department",
            "Delete role",
            "Delete employee",
            "View total utilized budget of a department",
            'Exit',
        ],
    }).then(async (answers: any) => {
        let results;
        switch (answers.choice) {
            case 'View departments':
                results = await orm.view('department');
                console.table(results.rows);
                renderMenu();
                break;
            case 'View roles':
                results = await orm.view('role');
                console.table(results.rows);
                renderMenu();
                break;
            case 'View all employees':
                results = await orm.view('employee');
                console.table(results.rows);
                renderMenu();
                break;
            case 'View employees by manager':
                await viewEmployeesByManager();
                renderMenu();
                break;
            case 'View employees by department':
                await viewEmployeesByDepartment();
                renderMenu();
                break;
            case 'Add department':
                await add('department');
                renderMenu();
                break;
            case 'Add role':
                await add('role');
                renderMenu();
                break;
            case 'Add employee':
                await add('employee');
                renderMenu();
                break;
            case 'Update employee role':
                await updateEmployee("role")
                renderMenu()
                break;
            case 'Update employee manager':
                await updateEmployee("manager")
                renderMenu()
                break;
            case 'Delete department':
                await deleteEntry("department");
                renderMenu();
                break;
            case 'Delete role':
                await deleteEntry("role");
                renderMenu();
                break;
            case 'Delete employee':
                await deleteEntry("employee");
                renderMenu();
                break;
            case 'View total utilized budget of a department':
                await getDepartmentBudget();
                renderMenu();
                break;
            case 'Exit':
                process.exit(0);
            default:
                console.log('Invalid choic: ' + answers.choice);
                break;
        }
    })
}

renderMenu();

async function add(mode: string) {
    switch (mode) {
        case "department":
            await inquirer.prompt({
                type: 'input',
                name: 'name',
                message: 'Enter the name of the department',
            }).then(async (answers: any) => {
                await orm.add(mode, [answers.name]);
            });
            break;
        case "role":
            const departments = await orm.view('department');
            let departmentMap = new Map()
            await inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: 'Enter the title of the role',
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: 'Enter the salary of the role',
                },
                {
                    type: 'list',
                    name: 'department_id',
                    message: 'Enter the department of the role',
                    choices: departments.rows.map((department: any) => {
                        departmentMap.set(department.name, department.id)
                        return department.name
                    })
                }]
            ).then(async (answers: any) => {
                await orm.add(mode, [answers.title, answers.salary, departmentMap.get(answers.department_id)]);
            });
            break;
        case "employee":
            const roles = await orm.view('role');
            const managers = await orm.viewManagers();
            let roleMap = new Map();
            let managerMap = new Map();
            await inquirer.prompt([
                {
                    type: 'input',
                    name: 'first_name',
                    message: 'Enter the first name of the employee',
                },
                {
                    type: 'input',
                    name: 'last_name',
                    message: 'Enter the last name of the employee',
                },
                {
                    type: 'list',
                    name: 'role_id',
                    message: 'Enter the role of the employee',
                    choices: roles.rows.map((role: any) => {
                        roleMap.set(role.title, role.id)
                        return role.title
                    }
                    )
                },
                {
                    type: 'list',
                    name: 'manager_id',
                    message: 'Enter the manager of the employee',
                    choices: ["None"].concat(managers.rows.map((manager: any) => {
                        managerMap.set(manager.first_name + ' ' + manager.last_name, manager.id);
                        return manager.first_name + ' ' + manager.last_name
                    }))
                }])
                .then(async (answers: any) => {
                    await orm.add(mode, [answers.first_name, answers.last_name, roleMap.get(answers.role_id), managerMap.get(answers.manager_id)]);
                });
            break;
        default:
            throw console.error('Invalid mode: ', mode);
    }
}

async function viewEmployeesByManager() {
    const managers = await orm.viewManagers();
    let managerMap = new Map()
    await inquirer.prompt({
        type: 'list',
        name: 'manager_id',
        message: 'Select a manager',
        choices: managers.rows.map((manager: any) => {
            managerMap.set(manager.first_name + ' ' + manager.last_name, manager.id);
            return manager.first_name + ' ' + manager.last_name;
        })
    }).then(async (answers: any) => {
        const results = await orm.viewByManager(managerMap.get(answers.manager_id));
        console.table(results.rows);
    });
}

async function viewEmployeesByDepartment() {
    const departments = await orm.view('department');
    let departmentMap = new Map()
    await inquirer.prompt({
        type: 'list',
        name: 'department',
        message: 'Select a department',
        choices: departments.rows.map((department: any) => {
            departmentMap.set(department.name, department.id);
            return department.name;
        })
    }).then(async (answers: any) => {
        const results = await orm.viewByDepartment(departmentMap.get(answers.department));
        console.table(results.rows);
    });
}

async function deleteEntry(mode: string) {
    const data = await orm.view(mode);
    let choiceMap = new Map();
    await inquirer.prompt({
        type: 'list',
        name: 'choice',
        message: `Select a ${mode} to delete`,
        choices: data.rows.map((entry: any) => {
            let entryName = mode === 'department' ? entry.name : mode === 'role' ? entry.title : `${entry.first_name} ${entry.last_name}`
            choiceMap.set(entryName, entry.id);
            return entryName;
        })
    }).then(async (answers: any) => {
        const results = await orm.delete(mode, choiceMap.get(answers.choice))
        console.table(results.rows)
    })
}

async function updateEmployee(mode: string) {
    const employees = await orm.view("employee");
    const updateField = mode === "manager" ? await orm.viewManagers() : await orm.view(mode);
    let employeesMap = new Map();
    let updateMap = new Map();
    let choiceArr = mode ==="manager" ? ["None"] : [];

    await inquirer.prompt([{
        type: 'list',
        name: 'employee',
        message: `Select an employee to update`,
        choices: employees.rows.map((employee: any) => {
            employeesMap.set(employee.first_name + ' ' + employee.last_name, employee.id);
            return employee.first_name + ' ' + employee.last_name;
        })
    },
    {
        type: 'list',
        name: 'updateField',
        message: `Select new ${mode}`,
        choices: choiceArr.concat(updateField.rows.map((field: any) => {
            updateMap.set(mode === "role" ? field.title : `${field.first_name} ${field.last_name}`, field.id)
            return mode === "role" ? field.title : `${field.first_name} ${field.last_name}`
        }))
    }]).then(async (answers: any) => {
        const results = await orm.update(mode, updateMap.get(answers.updateField), employeesMap.get(answers.employee))
        console.table(results.rows);
    })
}

async function getDepartmentBudget() {
    const departments = await orm.view("department");
    let departmentMap = new Map()
    await inquirer.prompt({
        type: 'list',
        name: 'department',
        message: 'Select a department to view budget',
        choices: departments.rows.map((department: any) => {
            departmentMap.set(department.name, department.id);
            return department.name;
        })
    }).then(async (answers) => {
        const results = await orm.viewBudget(answers.department)
        console.table(results.rows);
    })
}