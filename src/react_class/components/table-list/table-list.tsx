export const TableList = () => {
  interface EmployeeListRows {
    employeeId: string;
    employeeName: string;
    employeePosition: string;
  }

  let employeeListRows: EmployeeListRows[] = [
    {
      employeeId: "0001",
      employeeName: "Dan Lester Sanz",
      employeePosition: "Software Engineer"
    },
    {
      employeeId: "0002",
      employeeName: "John Doe",
      employeePosition: "QA Engineer"
    }
  ];

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "2px solid black"
      }}
    >
      <thead>
        <tr>
          <th style={{ border: "2px solid black" }}>Employee Id</th>
          <th style={{ border: "2px solid black" }}>Employee Name</th>
          <th style={{ border: "2px solid black" }}>Employee Position</th>
        </tr>
      </thead>
      <tbody>
        {employeeListRows.map((data) => (
          <tr key={data.employeeId}>
            <td style={{ border: "2px solid black" }}>{data.employeeId}</td>
            <td style={{ border: "2px solid black" }}>{data.employeeName}</td>
            <td style={{ border: "2px solid black" }}>
              {data.employeePosition}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
