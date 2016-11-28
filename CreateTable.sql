drop table Prescription;
drop table Drug;
drop table diagnosis;
drop table DiagnosisInfo;
drop table generalizedAnalysis;
drop table generalizedAnalysisTitles;
drop table XRay;
drop table Result;
drop table Conclusion;
drop table ConclusionTypes;
drop table VisitSchedule;
drop table isOpen;
drop table WorkingSchedule;
drop table Patient;
drop table Positions cascade;
drop table Employee cascade;
drop table Person;


create table Person (
	idPassport varchar(256),
	firstName varchar(256) NOT NULL,
	secondName varchar(256) NOT NULL,
	address varchar(1024) NOT NULL,
	email varchar(1024) NOT NULL,
	telN varchar(256) NOT NULL,
	birthDay Date NOT NULL, 
	gender varchar(20) NOT NULL,
	hashPassword varchar(1024) NOT NULL,
	hashSalt varchar(1024) NOT NULL,
	Primary key(idPassport)  
);


create table Positions (
	idPos varchar(256),
	title varchar(256) NOT NULL,
	Primary key (idPos)
);

create table Employee (
	rating int NOT NULL default(0),
	idPos varchar(256),
	idEmp varchar(256) NOT NULL,
	roomN int NOT NULL,
	idPassport varchar(256),
	Primary key (idEmp),
	Foreign key (idPassport) references Person(idPassport),
	Foreign key (idPos) references Positions(idPos)
);

create table Patient (
	idIP varchar(256) NOT NULL,
	telFamily varchar(256) NOT NULL,
	idPassport varchar(256),
	Primary key (idIP),
	Foreign key (idPassport) references Person
);

create table WorkingSchedule (
	roomN int NOT NULL,
	startTime time NOT NULL,
	finishTime time NOT NULL,
	day date NOT NULL,
	Primary key(startTime, finishTime, day, roomN)
);


create table isOpen (
	idEmp varchar(256) NOT NULL,
	startTime time NOT NULL,
	finishTime time NOT NULL,
	day date NOT NULL,
	roomN int NOT NULL,
	Primary key (idEmp, startTime, finishTime, day),
	Foreign key (idEmp) references Employee(idEmp),
	Foreign key (startTime, finishTime, day, roomN) references WorkingSchedule
);

create table VisitSchedule (
	day date NOT NULL,
	startTime time NOT NULL,
	offsetTime time NOT NULL,
	idIP varchar(256) NOT NULL,
	idEmp varchar(256) NOT NULL,
	evoluation boolean default(false),
	primary key (idIP, idEmp, startTime, offsetTime, day),
	foreign key (idIP) references Patient,
	foreign key (idEmp) references Employee
);

create table ConclusionTypes (
	idTitle varchar(256) NOT NULL,
	title varchar(256) NOT NULL,
	primary key(idTitle)
);

create table Conclusion (
	idTitle varchar(256) NOT NULL,
	idConclusion int,
	primary key(idConclusion),
	foreign key (idTitle) references ConclusionTypes 
);

create table Result (
	day date NOT NULL,
	idIP varchar(256),
	idEmp varchar(256),
	idConclusion int,
	primary key (idConclusion, idIP, idEmp),
	foreign key (idConclusion) references Conclusion,
	foreign key (idIP) references Patient,
	foreign key (idEmp) references Employee
);

create table XRay (
	scan bit(2048),
	description varchar(256),
	idConclusion int,
	primary key (idConclusion),
	foreign key (idConclusion) references Conclusion
);

create table generalizedAnalysis (
	idConclusion int,
	result real,
	standard varchar(256),
	primary key (idConclusion),
	foreign key (idConclusion) references conclusion
);

create table DiagnosisInfo (
	title varchar(256),
	idTitle int,
	nationalCode varchar(20),
	rate real default(0),
	primary key (idTitle)
);

create table diagnosis (
	idTitle int,
	idConclusion int,
	anamnes varchar(2048),
	primary key (idConclusion),
	foreign key (idConclusion) references Conclusion,
	foreign key (idTitle) references DiagnosisInfo
);

create table Drug (
	tradeName varchar(256),
	formula varchar(256),
	primary key (tradeName)
);

create table Prescription (
	expirationDay date NOT NULL,
	day date NOT NULL,
	idIP varchar(256),
	idEmp varchar(256),
	tradeName varchar(256),
	primary key(idIP, idEmp, tradeName),
	foreign key (tradeName) references Drug,
	foreign key (idIP) references Patient,
	foreign key (idEmp) references Employee
);