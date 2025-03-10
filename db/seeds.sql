INSERT INTO department (name)
VALUES ('Engineering'), ('Sales'), ('Finance'), ('Legal'), ('HR');

INSERT INTO role (title, salary, department_id)
VALUES ('Lead Engineer', 100000, 1),
       ('Software Engineer', 80000, 1),
       ('Sales Lead', 100000, 2),
       ('Salesperson', 80000, 2),
       ('Accountant', 85000, 3),
       ('Legal Team Lead', 90000, 4),
       ('Lawyer', 75000, 4),
       ('HR Lead', 80000, 5),
       ('HR Assistant', 60000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('John', 'Doe', 1, NULL),
       ('Mike', 'Chan', 2, 1),
       ('Ashley', 'Rodriguez', 3, NULL),
       ('Kevin', 'Tupik', 4, 3),
       ('Kunal', 'Singh', 5, NULL),
       ('Malia', 'Brown', 6, 5),
       ('Sarah', 'Lourd', 7, NULL),
       ('Tom', 'Allen', 8, 7),
       ('Maggie', 'Baker', 9, 5);