import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Header } from "../../components/Header/Header";
import "./BookingManagement.css";

export const BookingManagement = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // State for the left calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // State for the big calendar
  const [bigCurrentMonth, setBigCurrentMonth] = useState(new Date().getMonth());
  const [bigCurrentYear, setBigCurrentYear] = useState(new Date().getFullYear());

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleBigPrevMonth = () => {
    if (bigCurrentMonth === 0) {
      setBigCurrentMonth(11);
      setBigCurrentYear(bigCurrentYear - 1);
    } else {
      setBigCurrentMonth(bigCurrentMonth - 1);
    }
  };

  const handleBigNextMonth = () => {
    if (bigCurrentMonth === 11) {
      setBigCurrentMonth(0);
      setBigCurrentYear(bigCurrentYear + 1);
    } else {
      setBigCurrentMonth(bigCurrentMonth + 1);
    }
  };

  const renderCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    let days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<li key={`inactive-prev-${i}`} className="inactive">{daysInPrevMonth - firstDay + i + 1}</li>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(<li key={`day-${i}`} className={i === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? "selected" : ""}>{i}</li>);
    }

    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(<li key={`inactive-next-${i}`} className="inactive">{i}</li>);
    }

    return days;
  };

  const renderBigCalendar = () => {
    const firstDay = new Date(bigCurrentYear, bigCurrentMonth, 1).getDay();
    const daysInMonth = new Date(bigCurrentYear, bigCurrentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(bigCurrentYear, bigCurrentMonth, 0).getDate();

    let days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<td key={`inactive-prev-${i}`} className="inactive">{daysInPrevMonth - firstDay + i + 1}</td>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(<td key={`day-${i}`} className={i === new Date().getDate() && bigCurrentMonth === new Date().getMonth() && bigCurrentYear === new Date().getFullYear() ? "selected" : ""}>{i}</td>);
    }

    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(<td key={`inactive-next-${i}`} className="inactive">{i}</td>);
    }

    return days;
  };

  return (
    <>
    <div className="booking-management-container">
      <Header />
          <div className="booking-management">
      <div className="left-container">
        <div className="user-profile">
          <img src="/assets/profile-pic.jpg" alt="User" className="user-image" />
          <div className="user-details">
            <label className="name">Maison D</label>
            <label className="occupation">Technical Architect</label>
          </div>
        </div>
        <div className="booking-container">
          <label>Book Time</label>
          <div className="time-selectors">
            <select className="from-date">
              <option value="">08:00 AM</option>
              <option value="">09:00 AM</option>
              <option value="">10:00 AM</option>
              <option value="">11:00 AM</option>
              <option value="">12:00 PM</option>
            </select>
            <select className="to-date">
              <option value="">08:30 AM</option>
              <option value="">09:30 AM</option>
              <option value="">10:30 AM</option>
              <option value="">11:30 AM</option>
              <option value="">12:30 PM</option>
            </select>
          </div>
          <button className="booking-button">BOOK MY SLOT</button>
        </div>
        <div className="calendar-container">
          <header className="calendar-header">
            <div className="calendar-navigation">
              <FaChevronLeft id="calendar-prev" className="chevron-icon" onClick={handlePrevMonth} />
              <p className="calendar-current-date">{months[currentMonth]} {currentYear}</p>
              <FaChevronRight id="calendar-next" className="chevron-icon" onClick={handleNextMonth} />
            </div>
          </header>
          <div className="calendar-body">
            <ul className="calendar-weekdays">
              <li>MO</li>
              <li>TU</li>
              <li>WE</li>
              <li>TH</li>
              <li>FR</li>
              <li>SA</li>
              <li>SU</li>
            </ul>
            <ul className="calendar-dates">
              {renderCalendar()}
            </ul>
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="big-calendar-header">
          <div className="big-calendar-navigation">
            <FaChevronLeft id="big-calendar-prev" className="chevron-icon" onClick={handleBigPrevMonth} />
            <p className="big-calendar-current-date">{months[bigCurrentMonth]} {bigCurrentYear}</p>
            <FaChevronRight id="big-calendar-next" className="chevron-icon" onClick={handleBigNextMonth} />
          </div>
          <div className="date-buttons">
            <button className="day">Day</button>
            <button className="week">Week</button>
            <button className="month active">Month</button>
          </div>
          <div className="search-bar">
            <input type="text" className="search-input" placeholder="Search here" />
          </div>
        </div>
        <div className="big-calendar-body">
          <table className="big-calendar-table">
            <thead>
              <tr>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
                <th>Sunday</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {renderBigCalendar().slice(0, 7)}
              </tr>
              <tr>
                {renderBigCalendar().slice(7, 14)}
              </tr>
              <tr>
                {renderBigCalendar().slice(14, 21)}
              </tr>
              <tr>
                {renderBigCalendar().slice(21, 28)}
              </tr>
              <tr>
                {renderBigCalendar().slice(28, 35)}
              </tr>
              <tr>
                {renderBigCalendar().slice(35, 42)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
    </>
  );
};
