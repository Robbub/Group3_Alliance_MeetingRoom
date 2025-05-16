import axios from "axios";
import { useEffect } from "react";

export const Dashboard = () => {
  // Run json-server --watch db.json --port 3000
  const getEmployees = async () => {
    return axios.get("http://localhost:3000/statistics");
  };

  useEffect(() => {
    getEmployees()
      .then((response) => {
        console.log(response.data);
      })
      .catch((data) => {
        console.log(data);
      })
      .finally(() => {});
  }, []);

  return (
    <div>
      <h1>Dashboard Screen</h1>
    </div>
  );
};
