import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowRight, FaChartLine, FaUser, FaDoorOpen } from "react-icons/fa";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Header } from "../../../views/components/Header/Header";
import "./Analytics.css";

export const Analytics = () => {
  const [bookingOverTimeData, setBookingOverTimeData] = useState([]);
  const [totalBookingsPerRoomData, setTotalBookingsPerRoomData] = useState([]);
  const [bookingsPerUserData, setBookingsPerUserData] = useState([]);
  const [meetingTypesData, setMeetingTypesData] = useState([]);
  const [meetingRoomAnalyticsData, setMeetingRoomAnalyticsData] = useState([]);

  useEffect(() => {
    fetch('/db.json') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        setBookingOverTimeData(data.bookingOverTimeData || []);
        setTotalBookingsPerRoomData(data.totalBookingsPerRoomData || []);
        setBookingsPerUserData(data.bookingsPerUserData || []);
        setMeetingTypesData(data.meetingTypesData || []);
        setMeetingRoomAnalyticsData(data.meetingRoomAnalyticsData || []);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const barColors = ["#D28D5F", "#A56D48", "#7F5539"];

  const pieColors = ["#D28D5F", "#A56D48", "#7F5539", "#B08968"];

  return (
    <div className="analytics">
      <Header />
      <div className="analytics-container">
        <div className="filters-container">
          <form>
            <div className="date-range">
              <input type="date" id="from-date" name="from-date" />
              <FaArrowRight style={{ margin: '0 10px' }} />
              <input type="date" id="to-date" name="to-date" />
            </div>
          </form>

          <select name="users" id="users">
            <option value="users">zekken</option>
            <option value="users">Tenz</option>
            <option value="users">F0rsaken</option>
            <option value="users">MaisonD</option>
          </select>

          <select name="rooms" id="rooms">
            <option value="rooms">BRD1</option>
            <option value="rooms">BRD2</option>
            <option value="rooms">BRD3</option>
            <option value="rooms">BRD4</option>
          </select>

          <button>Apply Filters</button>
        </div>

        <div className="line-chart-container">
          <label htmlFor="">Booking Over Time</label>
          <div className="chart-and-icons-container">
            <div className="line-chart">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bookingOverTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bookings" stroke="#64442F" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="analytics-icons">
              <div className="icon-text">
                <FaChartLine className="icon" />
                <p>Peak Usage Hours: 10:00 AM - 12:00 PM</p>
              </div>
              <div className="icon-text">
                <FaUser className="icon" />
                <p>Most Active User: tenz</p>
              </div>
              <div className="icon-text">
                <FaDoorOpen className="icon" />
                <p>Most Booked Room: A101</p>
              </div>
            </div>
          </div>
          <div className="line-chart-buttons">
            <button>Time</button>
            <button>Day</button>
            <button>Week</button>
            <button>Month</button>
          </div>
        </div>

        <div className="charts-container">
          <div className="bookings-per-room">
            <h2>Total Bookings Per Room</h2>
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={totalBookingsPerRoomData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings">
                    {totalBookingsPerRoomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bookings-per-user">
            <h2>Bookings Per User</h2>
            <div className="bar-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingsPerUserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="bookings" fill="#B08968" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="pie-charts-container">
          <div className="meeting-types">
            <h2>Meeting Types</h2>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={meetingTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {meetingTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="meeting-room-analytics">
            <h2>Meeting Room Analytics</h2>
            <div className="pie-chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={meetingRoomAnalyticsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {meetingRoomAnalyticsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
