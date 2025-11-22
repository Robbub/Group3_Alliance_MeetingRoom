import React, { useState, useEffect, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Header } from "../../../views/components/Header/Header";
import { useNavigate } from "react-router-dom";
import "./BookingManagement.css";

export const BookingManagement = () => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar navigation state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [bigCurrentMonth, setBigCurrentMonth] = useState(new Date().getMonth());
  const [bigCurrentYear, setBigCurrentYear] = useState(new Date().getFullYear());

  // View mode: month, week, day
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const [draggedDayIndex, setDraggedDayIndex] = useState<number | null>(null);

  const [currentDay, setCurrentDay] = useState<Date>(() => new Date());

  // Date selection
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);

  // Modal state
  const [isAmenitiesModalOpen, setIsAmenitiesModalOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("15:00");
  const [meetingTitle, setMeetingTitle] = useState("");

  const navigate = useNavigate();const [allAmenities, setAllAmenities] = useState<{ id: number; name: string; description: string }[]>([]);

  // Ref to track current selection in Week view
  const weekViewRef = useRef<{ start: Date | null; end: Date | null }>({ start: null, end: null });

  // Navigation handlers
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

  // Open modal with selected date range
  const openEventModal = (start: Date, end: Date) => {
    setSelectedRange({ start, end });

    // Auto-fill time for Week or Day view
    if (view === "week" || view === "day") {
      const startHour = start.getHours();
      const startMin = start.getMinutes();
      const endHour = end.getHours();
      const endMin = end.getMinutes();

      // Format as HH:mm
      const formatTime = (h: number, m: number) => 
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      setStartTime(formatTime(startHour, startMin));
      setEndTime(formatTime(endHour, endMin));
    }

    setIsAmenitiesModalOpen(true);
  };

  const renderSmallCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const today = new Date();
    
    let days = [];

    // Previous month's trailing days
    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + i + 1;
      days.push(
        <li key={`prev-${i}`} className="inactive">
          {day}
        </li>
      );
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = 
        i === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      days.push(
        <li 
          key={i} 
          className={isToday ? "today" : ""}
          style={{
            backgroundColor: isToday ? "#64442F" : "transparent",
            color: isToday ? "white" : "inherit",
            borderRadius: isToday ? "50%" : "0",
            fontWeight: isToday ? "bold" : "normal"
          }}
        >
          {i}
        </li>
      );
    }

    // Next month's leading days to fill the calendar
    const totalDays = days.length;
    const remainingDays = 42 - totalDays; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <li key={`next-${i}`} className="inactive">
          {i}
        </li>
      );
    }

    return days;
  };

  // Render calendar days (Month view only for now)
  const renderBigCalendar = () => {
    const firstDay = new Date(bigCurrentYear, bigCurrentMonth, 1).getDay();
    const daysInMonth = new Date(bigCurrentYear, bigCurrentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(bigCurrentYear, bigCurrentMonth, 0).getDate();

    let days = [];

    // Previous month's trailing days
    for (let i = 0; i < firstDay; i++) {
      const day = daysInPrevMonth - firstDay + i + 1;
      days.push(<td key={`prev-${i}`} className="inactive">{day}</td>);
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(bigCurrentYear, bigCurrentMonth, i);
      const isToday =
        i === new Date().getDate() &&
        bigCurrentMonth === new Date().getMonth() &&
        bigCurrentYear === new Date().getFullYear();

      const isSelected =
        selectedRange.start &&
        selectedRange.end &&
        date >= selectedRange.start &&
        date <= selectedRange.end;

      const handleMouseDown = () => {
        setIsDragging(true);
        setDragStart(date);
        setSelectedRange({ start: date, end: date });
      };

      const handleMouseEnter = () => {
        if (isDragging && dragStart) {
          const newEnd = date;
          const newStart = dragStart < newEnd ? dragStart : newEnd;
          const newEndDate = dragStart > newEnd ? dragStart : newEnd;
          setSelectedRange({ start: newStart, end: newEndDate });
        }
      };

      const handleClick = () => {
        if (!isDragging) {
          openEventModal(date, date);
        }
      };

      days.push(
        <td
          key={`day-${i}`}
          className={isSelected ? "selected" : ""}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          style={{
            cursor: "pointer",
            backgroundColor: isSelected ? "#af764eff" : "transparent",
            color: isSelected ? "white" : "inherit",
            border: "1px solid #ccc",
            padding: "35px 45px",
            textAlign: "center",
            verticalAlign: "top"
          }}
        >
          {i}
        </td>
      );
    }

    // Next month's leading days
    const totalDays = days.length;
    const remainingDays = 42 - totalDays;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(<td key={`next-${i}`} className="inactive">{i}</td>);
    }

    return days;
  };

  // Generate time slots for Week view (1 AM to 11 PM, 15-min intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 1; hour <= 23; hour++) {
      slots.push(hour);
    }
    return slots;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    return monday;
  });

  // Navigation
  const handlePrevWeek = () => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeek);
  };

  // Helper
  const getWeekDisplayText = (weekStart: Date) => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);

    const startMonthIndex = start.getMonth();
    const endMonthIndex = end.getMonth();
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    const startMonthAbbr = months[startMonthIndex].substring(0, 3);
    const endMonthAbbr = months[endMonthIndex].substring(0, 3);

    if (startYear !== endYear) {
      // Different years → show both months and years
      return `${startMonthAbbr} ${startYear} – ${endMonthAbbr} ${endYear}`;
    } else if (startMonthIndex !== endMonthIndex) {
      // Same year, different months → "Oct – Nov 2025"
      return `${startMonthAbbr} – ${endMonthAbbr} ${startYear}`;
    } else {
      // Same month → "Oct 2025"
      return `${startMonthAbbr} ${startYear}`;
    }
  };

  const timeSlots = generateTimeSlots();

  // Render Week View
  const renderWeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }

    return (
      <div className="week-view-container">
        {/* Fixed Header Row */}
        <div className="week-header-row">
          <div 
            className="time-header-placeholder"
            style={{
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0'
            }}
          ></div>
          {days.map((day, index) => (
            <div 
              key={`fixed-header-${index}`} 
              className="fixed-day-header"
              style={{
                border: '1px solid #ccc',
                borderLeft: index === 0 ? '1px solid #ccc' : 'none',
                backgroundColor: '#f0f0f0',
                color: '#64442F'
              }}
            >
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
              <br />
              {day.getDate()}
            </div>
          ))}
        </div>

        {/* Scrollable Time Grid */}
        <div className="week-scrollable-grid">
          <div className="time-column">
            {timeSlots.map((hour, index) => (
              <div 
                key={`time-${index}`} 
                className="time-slot-label"
                style={{
                  border: '1px solid #ccc',
                  borderTop: 'none',
                  backgroundColor: '#f9f9f9'
                }}
              >
                {hour === 12 
                  ? "12 PM" 
                  : hour > 12 
                    ? `${hour - 12} PM` 
                    : `${hour} AM`}
              </div>
            ))}
          </div>

          <div className="days-grid">
            {days.map((day, dayIndex) => (
              <div 
                key={`day-col-${dayIndex}`} 
                className="day-column"
                style={{
                  borderRight: '1px solid #ccc'
                }}
              >
                {timeSlots.map((hour, slotIndex) => {
                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);

                  const isSelected =
                    selectedRange.start &&
                    selectedRange.end &&
                    slotDate >= selectedRange.start &&
                    slotDate <= selectedRange.end &&
                    // Only highlight if in the dragged day (or no drag active)
                    (draggedDayIndex === null || draggedDayIndex === dayIndex);

                  const handleMouseDown = () => {
                    setIsDragging(true);
                    setDragStart(slotDate);
                    setDraggedDayIndex(dayIndex); // 🔑 Lock to this day
                    setSelectedRange({ start: slotDate, end: slotDate });
                    weekViewRef.current = { start: slotDate, end: slotDate };
                  };

                  const handleMouseEnter = () => {
                    if (isDragging && dragStart && draggedDayIndex === dayIndex) {
                      // Only allow selection within the same day
                      const newEnd = slotDate;
                      const newStart = dragStart < newEnd ? dragStart : newEnd;
                      const newEndDate = dragStart > newEnd ? dragStart : newEnd;
                      setSelectedRange({ start: newStart, end: newEndDate });
                      weekViewRef.current = { start: newStart, end: newEndDate };
                    }
                  };

                  const handleClick = () => {
                    if (!isDragging) {
                      setDraggedDayIndex(dayIndex); // For single click
                      openEventModal(slotDate, slotDate);
                    }
                  };

                  return (
                    <div
                      key={`cell-${dayIndex}-${slotIndex}`}
                      className={`time-slot ${isSelected ? 'selected' : ''}`}
                      onMouseDown={handleMouseDown}
                      onMouseEnter={handleMouseEnter}
                      onClick={handleClick}
                      style={{
                        border: '1px solid #ccc',
                        borderTop: 'none',
                        borderRight: 'none',
                        borderLeft: 'none',
                        backgroundColor: isSelected ? '#af764eff' : 'transparent',
                        cursor: 'pointer'
                      }}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handlePrevDay = () => {
    const newDay = new Date(currentDay);
    newDay.setDate(currentDay.getDate() - 1);
    setCurrentDay(newDay);
  };

  const handleNextDay = () => {
    const newDay = new Date(currentDay);
    newDay.setDate(currentDay.getDate() + 1);
    setCurrentDay(newDay);
  };

  const getDayDisplayText = (date: Date) => {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Render Day View
  const renderDayView = () => {
    return (
      <div className="day-view-container">
        {/* Fixed Header Row */}
        <div className="day-header-row">
          <div 
            className="time-header-placeholder"
            style={{
              border: '1px solid #ccc',
              backgroundColor: '#f0f0f0',
              width: '80px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#64442F'
            }}
          >
            {currentDay.toLocaleDateString('en-US', { weekday: 'short' })}
            <br />
            {currentDay.getDate()}
          </div>
        </div>

        {/* Time Grid */}
        <div className="day-time-grid">
          <div className="time-column">
            {timeSlots.map((hour, index) => (
              <div 
                key={`time-${index}`} 
                className="time-slot-label"
                style={{
                  border: '1px solid #ccc',
                  borderTop: 'none',
                  backgroundColor: '#f9f9f9',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#666',
                  fontWeight: 'bold'
                }}
              >
                {hour === 12 
                  ? "12 PM" 
                  : hour > 12 
                    ? `${hour - 12} PM` 
                    : `${hour} AM`}
              </div>
            ))}
          </div>

          <div className="day-column-single">
            {timeSlots.map((hour, slotIndex) => {
              const slotDate = new Date(currentDay);
              slotDate.setHours(hour, 0, 0, 0);

              const isSelected =
                selectedRange.start &&
                selectedRange.end &&
                slotDate >= selectedRange.start &&
                slotDate <= selectedRange.end;

              const handleMouseDown = () => {
                setIsDragging(true);
                setDragStart(slotDate);
                setSelectedRange({ start: slotDate, end: slotDate });
                weekViewRef.current = { start: slotDate, end: slotDate };
              };

              const handleMouseEnter = () => {
                if (isDragging && dragStart) {
                  const newEnd = slotDate;
                  const newStart = dragStart < newEnd ? dragStart : newEnd;
                  const newEndDate = dragStart > newEnd ? dragStart : newEnd;
                  setSelectedRange({ start: newStart, end: newEndDate });
                  weekViewRef.current = { start: newStart, end: newEndDate };
                }
              };

              const handleClick = () => {
                if (!isDragging) {
                  openEventModal(slotDate, slotDate);
                }
              };

              return (
                <div
                  key={`cell-${slotIndex}`}
                  className={`time-slot ${isSelected ? 'selected' : ''}`}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onClick={handleClick}
                  style={{
                    border: '1px solid #ccc',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    backgroundColor: isSelected ? '#af764eff' : 'transparent',
                    height: '26px',
                    cursor: 'pointer'
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Close modal on mouse up (outside drag logic)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging && dragStart && selectedRange.start && selectedRange.end) {
        setIsDragging(false);
        openEventModal(selectedRange.start, selectedRange.end);
      }
      // Reset drag state
      setDraggedDayIndex(null);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, dragStart, selectedRange, draggedDayIndex]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch('https://localhost:3150/api/Room/GetAmenities'); // Adjust URL if needed
        if (!response.ok) {
          throw new Error(`Failed to fetch amenities: ${response.status}`);
        }
        const data = await response.json();
        setAllAmenities(data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        // Handle error appropriately, maybe set an error state or show a message
      }
    };

    fetchAmenities();
  }, []);

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
            <div className="calendar-container">
              <header className="calendar-header">
                <div className="calendar-navigation">
                  <FaChevronLeft id="calendar-prev" className="chevron-icon" onClick= {handlePrevMonth} />
                  <p className="calendar-current-date">{months[currentMonth]} {currentYear}</p>
                  <FaChevronRight id="calendar-next" className="chevron-icon" onClick={handleNextMonth} />
                </div>
              </header>
              <div className="calendar-body">
                <ul className="calendar-weekdays">
                  <li>MO</li><li>TU</li><li>WE</li><li>TH</li><li>FR</li><li>SA</li><li>SU</li>
                </ul>
                <ul className="calendar-dates">
                  {renderSmallCalendar()}
                </ul>
              </div>
            </div>
          </div>

          <div className="right-container">
            <div className="big-calendar-header">
              <div className="big-calendar-navigation">
                <FaChevronLeft 
                  id="big-calendar-prev" 
                  className="chevron-icon" 
                  onClick={
                    view === "month" ? handleBigPrevMonth : 
                    view === "week" ? handlePrevWeek : 
                    handlePrevDay
                  } 
                />
                <p className="big-calendar-current-date">
                  {view === "month" 
                    ? `${months[bigCurrentMonth]} ${bigCurrentYear}` 
                    : view === "week" 
                      ? getWeekDisplayText(currentWeekStart)
                      : getDayDisplayText(currentDay)
                  }
                </p>
                <FaChevronRight 
                  id="big-calendar-next" 
                  className="chevron-icon" 
                  onClick={
                    view === "month" ? handleBigNextMonth : 
                    view === "week" ? handleNextWeek : 
                    handleNextDay
                  } 
                />
              </div>
              {/* View Toggle Buttons */}
              <div className="date-buttons">
                <button 
                  className={view === "day" ? "day active" : "day"} 
                  onClick={() => setView("day")}
                >
                  Day
                </button>
                <button 
                  className={view === "week" ? "week active" : "week"} 
                  onClick={() => setView("week")}
                >
                  Week
                </button>
                <button 
                  className={view === "month" ? "month active" : "month"} 
                  onClick={() => setView("month")}
                >
                  Month
                </button>
              </div>

            </div>

            {/* Render based on view */}
            {view === "month" && (
              <div className="big-calendar-body">
                <table className="big-calendar-table" style={{ border: '1px solid #ccc', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Monday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Tuesday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Wednesday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Thursday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Friday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Saturday</th>
                      <th style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#f0f0f0' }}>Sunday</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>{renderBigCalendar().slice(0, 7)}</tr>
                    <tr>{renderBigCalendar().slice(7, 14)}</tr>
                    <tr>{renderBigCalendar().slice(14, 21)}</tr>
                    <tr>{renderBigCalendar().slice(21, 28)}</tr>
                    <tr>{renderBigCalendar().slice(28, 35)}</tr>
                    <tr>{renderBigCalendar().slice(35, 42)}</tr>
                  </tbody>
                </table>
              </div>
            )}

            {view === "week" && (
              <div className="big-calendar-body">
                {renderWeekView()}
              </div>
            )}

            {view === "day" && renderDayView()}
          </div>
        </div>
      </div>

      {/* Amenities + Time Modal */}
      {isAmenitiesModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAmenitiesModalOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="amenities-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              padding: "30px",
              borderRadius: "16px",
              width: "450px",
              maxWidth: "90vw",
            }}
          >
            {/* Meeting Title */}
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Add Title"
              style={{
                width: "94%",
                padding: "12px",
                marginBottom: "15px",
                border: "2px solid #64442F",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#64442F",
              }}
            />

            {/* Date Range Text */}
            {selectedRange.start && selectedRange.end && (
              <p
                style={{
                  textAlign: "center",
                  margin: "0 0 15px 0",
                  fontSize: "14px",
                  color: "#64442F",
                  fontWeight: "normal",
                }}
              >
                {selectedRange.start.toDateString() === selectedRange.end.toDateString()
                  ? `Meeting on ${selectedRange.start.toDateString()}`
                  : `Meeting from ${selectedRange.start.toDateString()} to ${selectedRange.end.toDateString()}`}
              </p>
            )}

            {/* Time Selection */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
              <label>Start:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
              <span>to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ padding: "6px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>

            {/* Required Amenities */}
            <h3 style={{ marginBottom: "10px", color: "#64442F", fontWeight: "bold" }}>Required Amenities</h3>
            <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "20px" }}>
              {allAmenities.map((amenity) => (
                <label key={amenity.id} style={{ display: "block", margin: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAmenities([...selectedAmenities, amenity.name]);
                      } else {
                        setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity.name));
                      }
                    }}
                  />
                  <span style={{ marginLeft: "10px" }}>{amenity.name}</span>
                </label>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => setIsAmenitiesModalOpen(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedRange.start) return;
                  const amenitiesParam = selectedAmenities.join(",");
                  const dateStr = selectedRange.start.toISOString().split("T")[0];
                  const endDateStr = selectedRange.end ? selectedRange.end.toISOString().split("T")[0] : "";
                  
                  // Build the URL with end date for recurrence detection
                  let url = `/browse?amenities=${encodeURIComponent(amenitiesParam)}&date=${dateStr}&startTime=${startTime}&endTime=${endTime}&title=${encodeURIComponent(meetingTitle)}`;
                  
                  // Add end date if it's different from start date
                  if (endDateStr && endDateStr !== dateStr) {
                    url += `&endDate=${endDateStr}`;
                  }
                  
                  navigate(url);
                }}
                disabled={selectedAmenities.length === 0}
                style={{
                  padding: "10px 20px",
                  backgroundColor: selectedAmenities.length === 0 ? "#ddd" : "#64442F",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selectedAmenities.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Continue to Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};