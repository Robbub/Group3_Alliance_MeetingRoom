enum Section {
  SECTION1 = "Section 1",
  SECTION2 = "Section 2",
  SECTION3 = "Section 3",
  SECTION4 = "Section 4"
}

interface StudentDetail {
  id: number;
  name: string;
  email: string;
  section: Section;
  password?: string;
}

let arrayObject: StudentDetail[];

let sampleArray: Array<StudentDetail> = [];

export const createStudent = (studentDetail: StudentDetail) => {
  let sampleValue: any = 404;
  sampleValue = sampleValue as string;
  // return `New student has been created,
  //      Name: ${studentDetail.name},
  //      Section: ${studentDetail.section}`;
};
