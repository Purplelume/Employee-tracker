INSERT INTO department (name)
VALUES 
('Game Design'),
('IT'),
('Sales & Marketing');

INSERT INTO role (title, salary, department_id)
VALUES
('Game Developers', 140000, 1),
('Game Artist', 120000, 1),
('Full Stack Developer', 100000, 2),
('Software Engineer', 120000, 2),
('Marketing Coordindator', 70000, 3), 
('Sales Lead', 90000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Marco', 'Polo', 2, null),
('Yun', 'Zhao', 1, 1),
('Paolo', 'Rossi', 1, null),
('Mary', 'Poppins', 3, 3),