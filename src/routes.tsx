// import { Route, Routes } from "react-router";
// import * as Views from "./views/containers";

// export const AppRoutes = () => {
//   return (
//     <Routes>
//       <Route path="employee-list" element={<Views.EmployeeList />} />
//       <Route path="employee-add" element={<Views.EmployeeForm />} />
//       <Route path="employee-details" element={<Views.EmployeeDetails />} />

//       <Route path="*" element={<Views.NotFoundScreen />} />
//     </Routes>
//   );
// };

// TODO
import { BrowserRouter, Route, Routes } from "react-router";
import * as Views from "./views/containers";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Views.MainScreen />}>
          <Route path="employee-list" element={<Views.EmployeeList />} />
          <Route path="employee-add" element={<Views.EmployeeForm />} />
          <Route path="employee-details" element={<Views.EmployeeDetails />} />
        </Route>
        <Route path="*" element={<Views.NotFoundScreen />} />
      </Routes>
    </BrowserRouter>
  );
};
