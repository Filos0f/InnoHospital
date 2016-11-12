create table Person (
	idPassport varchar(256),
	firstName varchar(256) NOT NULL,
	secondName varchar(256) NOT NULL,
	address varchar(256) NOT NULL,
	email varchar(256) NOT NULL,
	telN varchar(256) NOT NULL,
	birthDay Date NOT NULL, 
	gender varchar(20) NOT NULL,
	hashPassword varchar(256) NOT NULL,
	hashSalt varchar(256) NOT NULL,
	Primary key(idPassport)  
);

create table Positions (
	idPos int NOT NULL,
	title varchar(256) NOT NULL,
	idEmp varchar(256),
	Primary key (idPos)
);

create table Employee (
	rating int NOT NULL default(0),
	idPos int NOT NULL,
	idEmp varchar(256) NOT NULL,
	roomN int NOT NULL,
	idPassport varchar(256),
	Primary key (idPassport),
	Foreign key (idPassport) references Person,
	Foreign key (idPos) references Positions
);


create table Patient (
	idIP varchar(256) NOT NULL,
	telFamily varchar(256) NOT NULL,
	idPassport varchar(256),
	Primary key (idPassport),
	Foreign key (idPassport) references Person
);

ALTER TABLE Positions ADD CONSTRAINT PosForeignKey Foreign key (idEmp) references Employee;

create table WorkingSchedule (
	roomN int NOT NULL,
	startTime time,
	finishTime time,
	day date,
	Primary key(startTime, finishTime, day)
);


create table isOpen (
	idEmp varchar(256),
	startTime time,
	finishTime time,
	day date,
	Primary key (idEmp, startTime, finishTime, day),
	Foreign key (idEmp) references Employee,
	Foreign key (startTime, finishTime, day) references WorkingSchedule
);

create table VisitSchedule (
	day date,
	startTime time,
	offsetTime time,
	idIP varchar(256),
	idEmp varchar(256),
	evoluation boolean default(false),
	primary key (idIP, idEmp),
	foreign key (idIP) references Patient,
	foreign key (idEmp) references Employee
);

create table ConclusionTypes (
	idType varchar(256) NOT NULL,
	title varchar(256) NOT NULL,
	primary key(idType)
);

create table Conclusion (
	idType varchar(256) NOT NULL,
	id int,
	primary key(id),
	foreign key (idType) references ConclusionTypes 
);

create table Result (
	day date NOT NULL,
	idIP varchar(256),
	idEmp varchar(256),
	id int,
	primary key (id, idIP, idEmp),
	foreign key (id) references Conclusion,
	foreign key (idIP) references Patient,
	foreign key (idEmp) references Employee
);

create table XRay (
	scan bit(2048),
	description varchar(256),
	id int,
	primary key (id),
	foreign key (id) references Conclusion
);

create table generalizedAnalysisTitles (
	idTitle varchar(256),
	title varchar(256),
	standard real,
	primary key(idTitle)
);

create table generalizedAnalysis (
	idTitle varchar(256),
	id int,
	result real,
	primary key (id),
	foreign key (id) references conclusion,
	foreign key (idTitle) references generalizedAnalysisTitles
);

create table diagnosis (
	idTitle int,
	nationalCode varchar(20),
	id int,
	primary key (id),
	foreign key (id) references Conclusion
);

create table DiagnosisInfo (
	title varchar(256),
	idTitle int,
	nationalCode varchar(20),
	rate real default(0),
	primary key (idTitle)
);

create table DiagnosisHasInfo (
	idDiagnosis int,
	idDiagnosisInfo int,
	primary key (idDiagnosisInfo, idDiagnosis),
	foreign key (idDiagnosisInfo) references DiagnosisInfo,
	foreign key (idDiagnosis) references Diagnosis
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