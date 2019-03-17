insert into StudentProfile VALUES (1, 'Bharath', 'Karumudi', 'Cybersecurity', 'bhkarumu@syr.edu', '132 Woodview', 'Rochesterhills', 'MI', '48307', 'o')

INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal','Tom B. Erichsen','Skagen 21','Stavanger','4006','Norway');

select FNAME from StudentProfile where SUID=1

select * from StudentProfile where SUID=1
insert into Courses values ('CSE 682', 'Software Engineering', 1, 'Jan 2019', 'Mo')
insert into StudentEnrolledCourses values  (1,1,'CSE 682', 'E')
insert into Accounts values (1, 1, 7500,2300, '01/22/2019')

select * from Courses
select * from StudentEnrolledCourses
select * from Accounts

insert into SUFunFacts (seqid, Fact) values
(1, 'Syracuse ranked #53 among the Best National Universities'),
(2,'Ernie Davis was the first African American to win the Heisman Trophy in 1961 and was inducted into the College Football Hall of Fame in 1979. Yep, he went to Syracuse University.'),
(3, 'Syracuse has the largest snow plow in the world. Average snowfall is over 110 inches every year, a normal one won’t do!')
(4, 'SU’s original colors were pink and pea green.'),
(5, 'There are more than 245,000 Syracuse University alumni living in 162 countries and territories.')
