import React from "react";
import { Header } from "../../../views/components/Header/Header";
import "./Analytics.css";

export const Analytics = () => {
  return (
    <div className="analytics">
      <Header />
        <div className="analytics-container">
        <div className="analytics-screenshot1"></div>
        <div className="analytics-screenshot2"></div>
        </div>
    </div>
  );
};

export default Analytics;
