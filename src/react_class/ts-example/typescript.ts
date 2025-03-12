// ---- DECLARING VARIABLES WITH DIFFERENT TYPES
enum Grade {
  GRADE_ONE = "Grade 1",
  GRADE_TWO = "Grade 2",
  GRADE_THREE = "Grade 3"
  // Other grades here
}

enum Section {
  SECTION1 = "Section 1",
  SECTION2 = "Section 2",
  SECTION3 = "Section 3",
  SECTION4 = "Section 4"
}

interface SubjectsGrade {
  math: number;
  science: number;
  english: number;
}

let id: string = "STUD_ID_0001"; // Id must be a value of type string
let firstName: string = "Juan"; // First name must be a value of type string
let lastName: string = "Dela Cruz"; // Last name must be a value of type string
let age: number = 6; // Age must be a value of type number
let grade: Grade = Grade.GRADE_ONE; // Grade must be a value of type enum from Sections Enum
let section: Section = Section.SECTION1; // Section must be a value of type enum from Sections Enum
let subjects: string[] = ["Math", "Science", "English"]; // Subject must have a value of string array
let isGraduated: boolean = false; // Isgraduated must be a value of a boolean
let grades: SubjectsGrade = {
  math: 88.5,
  science: 92.4,
  english: 90
};

export const getStudentDetails = (): string => {
  return `Student Details,
    Id:${id},F
    Name: ${firstName} ${lastName}, 
    Section: ${section},
    Age: ${age},
    Grade: ${grade},
    Section: ${section},
    Subjects: ${subjects},
    Grades: ${grades},
    Graduated: ${isGraduated}`;
};

// ---- TYPE INTERFERENCE
let sampleStringValue = "Juan Dela Cruz"; // Typescript infers sampleStringValue as string
let sampleNumberValue = 404; // Typescript infers sampleNumberValue as number

export const getTypeInterference = () => {
  return `Type of sampleNumberValue is ${typeof sampleNumberValue}.
  Type of sampleStringValue is ${typeof sampleStringValue}`;
};

// ---- TYPE ASSERTIONS
let sampleAnyString: any = "Juan Dela Cruz";
let assertedAnyString = <string>sampleAnyString;

let sampleAnyNumber: any = 404;
let assertedAnyNumber = sampleAnyNumber as number;

export const getTypeAssertion = () => {
  return `Type of sampleNumberValue is ${typeof assertedAnyString}.
    Type of sampleStringValue is ${typeof assertedAnyNumber}`;
};
