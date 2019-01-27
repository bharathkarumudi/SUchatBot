CREATE TABLE [Students] (
	SUid integer NOT NULL,
	FName varchar(20) NOT NULL,
	LName varchar(20) NOT NULL,
	ProgramName varchar(50) NOT NULL,
	Email varchar(50) NOT NULL,
	Address Line varchar(100) NOT NULL,
	City varchar(30) NOT NULL,
	State varchar(30) NOT NULL,
	Zip varchar(5) NOT NULL,
	ClassMode varchar(1) NOT NULL,
  CONSTRAINT [PK_STUDENTS] PRIMARY KEY CLUSTERED
  (
  [SUid] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [Courses] (
	CourseID varchar(10) NOT NULL,
	CourseTitle varchar(30) NOT NULL,
	EnrollCount integer NOT NULL,
  CONSTRAINT [PK_COURSES] PRIMARY KEY CLUSTERED
  (
  [CourseID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [StudentEnrolledCourses] (
	SeqID integer NOT NULL,
	SUid integer NOT NULL,
	CourseID varchar(10) NOT NULL,
	Status varchar(1) NOT NULL,
  CONSTRAINT [PK_STUDENTENROLLEDCOURSES] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [Accounts] (
	SeqID integer NOT NULL,
	SUid integer NOT NULL,
	TermFee decimal NOT NULL,
	PaidAmount decimal NOT NULL,
	PaidDate datetime NOT NULL,
  CONSTRAINT [PK_ACCOUNTS] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO


ALTER TABLE [StudentEnrolledCourses] WITH CHECK ADD CONSTRAINT [StudentEnrolledCourses_fk0] FOREIGN KEY ([SUid]) REFERENCES [Students]([SUid])
ON UPDATE CASCADE
GO
ALTER TABLE [StudentEnrolledCourses] CHECK CONSTRAINT [StudentEnrolledCourses_fk0]
GO
ALTER TABLE [StudentEnrolledCourses] WITH CHECK ADD CONSTRAINT [StudentEnrolledCourses_fk1] FOREIGN KEY ([CourseID]) REFERENCES [Courses]([CourseID])
ON UPDATE CASCADE
GO
ALTER TABLE [StudentEnrolledCourses] CHECK CONSTRAINT [StudentEnrolledCourses_fk1]
GO

ALTER TABLE [Accounts] WITH CHECK ADD CONSTRAINT [Accounts_fk0] FOREIGN KEY ([SUid]) REFERENCES [Students]([SUid])
ON UPDATE CASCADE
GO
ALTER TABLE [Accounts] CHECK CONSTRAINT [Accounts_fk0]
GO

