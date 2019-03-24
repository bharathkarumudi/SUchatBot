CREATE TABLE [StudentProfile] (
	SUid integer NOT NULL,
	FirstName varchar(20) NOT NULL,
	LastName varchar(20) NOT NULL,
	ProgramName varchar(50) NOT NULL,
	Email varchar(50) NOT NULL,
	AddressLine varchar(100) NOT NULL,
	ClassMode varchar(10) NOT NULL,
	Phone varchar(15) NOT NULL,
	SlackID varchar(50) NOT NULL UNIQUE,
  CONSTRAINT [PK_STUDENTPROFILE] PRIMARY KEY CLUSTERED
  (
  [SUid] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [AvailableCourses] (
	SeqID integer NOT NULL,
	CourseID varchar(10) NOT NULL,
	CourseTitle varchar(30) NOT NULL,
	ClassScheduleDay varchar(3) NOT NULL,
	ClassSchedule varchar(10) NOT NULL,
	ExamSchedule date NOT NULL,
	Term date NOT NULL,
	EnrolledCount integer NOT NULL,
	Capacity integer NOT NULL,
  CONSTRAINT [PK_AVAILABLECOURSES] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [StudentEnrolledCourses] (
	SeqID integer NOT NULL,
	SUid integer NOT NULL,
	CourseID varchar(10) NOT NULL,
	Status varchar(1) NOT NULL,
	EnrolledFor datetime NOT NULL,
  CONSTRAINT [PK_STUDENTENROLLEDCOURSES] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [AccountsInformation] (
	SeqID integer NOT NULL,
	SUid integer NOT NULL,
	TermFee decimal NOT NULL,
	PaidAmount decimal NOT NULL,
	PaidDate datetime NOT NULL,
  CONSTRAINT [PK_ACCOUNTSINFORMATION] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO
CREATE TABLE [SUFunFacts] (
	SeqID integer NOT NULL,
	Fact varchar(5000) NOT NULL,
  CONSTRAINT [PK_SUFUNFACTS] PRIMARY KEY CLUSTERED
  (
  [SeqID] ASC
  ) WITH (IGNORE_DUP_KEY = OFF)

)
GO


ALTER TABLE [StudentEnrolledCourses] WITH CHECK ADD CONSTRAINT [StudentEnrolledCourses_fk0] FOREIGN KEY ([SUid]) REFERENCES [StudentProfile]([SUid])
ON UPDATE CASCADE
GO
ALTER TABLE [StudentEnrolledCourses] CHECK CONSTRAINT [StudentEnrolledCourses_fk0]
GO
ALTER TABLE [StudentEnrolledCourses] WITH CHECK ADD CONSTRAINT [StudentEnrolledCourses_fk1] FOREIGN KEY ([CourseID]) REFERENCES [AvailableCourses]([CourseID])
ON UPDATE CASCADE
GO
ALTER TABLE [StudentEnrolledCourses] CHECK CONSTRAINT [StudentEnrolledCourses_fk1]
GO

ALTER TABLE [AccountsInformation] WITH CHECK ADD CONSTRAINT [AccountsInformation_fk0] FOREIGN KEY ([SUid]) REFERENCES [StudentProfile]([SUid])
ON UPDATE CASCADE
GO
ALTER TABLE [AccountsInformation] CHECK CONSTRAINT [AccountsInformation_fk0]
GO


