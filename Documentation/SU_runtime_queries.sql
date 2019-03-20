insert into StudentProfile VALUES (1, 'Bharath', 'Karumudi', 'Cybersecurity', 'bhkarumu@syr.edu', '132 Woodview Rochesterhills MI 48307', 'online', '2488827545')
insert into StudentProfile VALUES (2, 'Haixin', 'Chag', 'Computer Science', 'hc302@syr.edu', '100 Sanfransico CA 54393', 'online', '87392738902')

insert into AccountsInformation values (1,3500,1000,'03/14/2019')
insert into AccountsInformation values (1,3500,1200,'03/16/2019')
insert into AccountsInformation values (2,3700,1800,'02/16/2019')

insert into AvailableCourses values('CIS675', 'Analysis of Algorithms', 'Mo', '6:00 PM', '06/20/2019', '04/07/2019', 0)
insert into AvailableCourses values('CSE682', 'Software Engineering', 'Mo', '9:00 PM', '06/18/2019', '04/10/2019', 0)

insert into StudentEnrolledCourses values (1, 'CIS675', 'E', '04/07/2019')
insert into StudentEnrolledCourses values (2, 'CIS682', 'E', '04/10/2019')
select * from StudentEnrolledCourses

select * from AvailableCourses
select FirstName,  LastName, ProgramName, Email, AddressLine, phone, ClassMode from StudentProfile StudentProfile where SUID=2
select * from AccountsInformation

select distinct(termfee) - sum(Paidamount)  from AccountsInformation where SUID=1 and DATEPART(quarter, paiddate) = DATEPART(quarter, GETDATE()) group by termfee

select courseid, coursetitle from AvailableCourses where DATEPART(quarter, term) = DATEPART(quarter, GETDATE()) +1
select concat(A.CourseID,' - ', B.coursetitle) as registered from StudentEnrolledCourses A, AvailableCourses B where A.courseid = B.courseid and A.SUID=1 and A.status='E'
SELECT Capacity-EnrolledCount FROM AvailableCourses WHERE courseid='CIS675' and DATEPART(quarter, term) = DATEPART(quarter, GETDATE()) +1

alter table AvailableCourses add Capacity integer
select * from AvailableCourses
update AvailableCourses set Capacity=20

insert into SUFunFacts (Fact) values
--('Syracuse ranked #53 among the Best National Universities'),
('Ernie Davis was the first African American to win the Heisman Trophy in 1961 and was inducted into the College Football Hall of Fame in 1979. Yep, he went to Syracuse University.')
--('Syracuse has the largest snow plow in the world. Average snowfall is over 110 inches every year, a normal one won’t do!')
--('SU’s original colors were pink and pea green.'),
--('There are more than 245,000 Syracuse University alumni living in 162 countries and territories.')

select * from SUFunFacts
