import { pool, connectToDb } from './connection.js';

class ORM {
    constructor() {}

    async connect() {
        try {
            await connectToDb();
        } catch (err) {
            console.error('Error connecting to database:', err);
            process.exit(1);
        }
    }

    async view(mode: string) {
        const sql = `SELECT * FROM ${mode}`;
        try {
            const result = await pool.query(sql);
            return result;
        }
        catch (err) {
            throw console.error(`Error reading ${mode}: ${err}`)
        }
    }

    async viewByManager(id: number) {
        const sql = `SELECT * FROM employee WHERE manager_id = $1`;
        const params = [id];
        try {
            const result = await pool.query(sql, params);
            return result;
        }
        catch (err) {
            throw console.error(`Error viwing employees by manager: ${err}`)
        }
    }

    async viewByDepartment(department: string) {
        const sql = `select employee.first_name, employee.last_name, department.name from employee left join 
        role on employee.role_id = role.id inner join
        department on role.department_id = department.id 
        where department.id = $1`
        const params = [department];
        try {
            const result = await pool.query(sql, params);
            return result;
        }
        catch (err) {
            throw console.error(`Error viewing employees in ${department}: ${err}`)
        }
    }

    async viewManagers() {
        const sql = `SELECT * FROM employee WHERE manager_id IS NULL`;
        try {
            const result = await pool.query(sql);
            return result;
        }
        catch (err) {
            throw console.error(`Error reading managers: ${err}`)
        }
    }

    async delete(mode: string, id: number) {
        const sql = `DELETE FROM ${mode} WHERE id = $1`;
        const params = [id];
        try {
            const result = await pool.query(sql, params);
            return result;
        }
        catch (err) {
            throw console.error(`Error deleting ${mode}: ${err}`)
        }
    }

    async add(mode: string, values: any) {
        const fields: string = mode === "department" ? "name" : mode === "role" ? "title, salary, department_id" : "first_name, last_name, role_id, manager_id"
        let sql = `INSERT INTO ${mode} (${fields}) VALUES (`;
        let params: any[] = [];
        values.forEach((value: any, index: number) => {
            sql += `$${index + 1}`;
            if (index < values.length - 1) {
                sql += ', ';
            }
            params.push(value);
        });
        sql += ')'
        try {
            const result = await pool.query(sql, params);
            return result;
        } catch (err) {
            throw console.error(`Error adding ${mode} to database: `, err);
        }
    }

    async update(mode: string, id: number, value: string) {
        const sql = `UPDATE employee SET ${mode}_id = $1 WHERE id = $2`;
        const params = [id, value];
        try {
            const result = await pool.query(sql, params);
            return result;
        }
        catch (err) {
            throw console.error(`Error updating employee ${mode}: ${err}`)
        }
    }

    async viewBudget(department: string) {
        const sql = `select sum(salary) as budget from role inner join 
	employee on employee.role_id = role.id inner join 
	department on role.department_id = department.id
    where department.name = $1`
        const params = [department];
        try {
            const result = await pool.query(sql, params);
            return result;
        }
        catch (err) {
            throw console.error(`Error getting ${department} budget: ${err}`)
        }
    }
}

export default ORM;

/*
        TODO
    -add try/catch blocks
*/