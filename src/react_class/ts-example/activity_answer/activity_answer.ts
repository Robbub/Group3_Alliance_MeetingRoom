export const activity1 = () => {
  interface EmployeeList {
    id: string;
    name: string;
    isDeleted: boolean;
  }

  const list: EmployeeList[] = [
    {
      id: "0",
      name: "Dan",
      isDeleted: false
    },
    {
      id: "1",
      name: "Lester",
      isDeleted: false
    },
    {
      id: "3",
      name: "Sanz",
      isDeleted: false
    },
    {
      id: "4",
      name: "Sanz",
      isDeleted: true
    }
  ];

  let dataFiltered: EmployeeList[] = [];

  list.forEach((data: EmployeeList) => {
    if (!data.isDeleted) {
      dataFiltered.push(data);
    }
  });

  return dataFiltered;
};
