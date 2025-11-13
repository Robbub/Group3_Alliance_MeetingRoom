import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Past.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface Booking {
  id: number;
  roomId: number;
  roomName: string;
  floor: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  organizer: string;
  participants: string[];
  recurring: boolean;
  frequency?: string;
  daysOfWeek?: string[];
  recurringEndDate?: string;
  image: string;
  createdAt?: string;
}

export const Past = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 3;

  const getCurrentUser = () => {
    const username = localStorage.getItem("username");
    return username || "Current User";
  };

  const currentUser = getCurrentUser();

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  // Fetch past bookings from backend
  useEffect(() => {
    const fetchPastBookings = async () => {
      try {
        const response = await fetch(`https://localhost:3150/api/Booking/GetPastBookings/${currentUser}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch past bookings: ${response.status}`);
        }
        const data: Booking[] = await response.json();
        console.log("Fetched past bookings:", data);
        
        // Transform backend data to frontend format
        const transformedBookings = data.map((booking: any) => ({
          id: booking.id,
          roomId: booking.roomId, // Add this line
          roomName: booking.roomName,
          floor: booking.floor,
          date: booking.date.split('T')[0], // Extract date part
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose || "",
          participants: booking.participants?.map((p: any) => p.name || p.userId) || [],
          organizer: booking.organizer,
          image: booking.image || "/assets/meeting-room1.jpg",
          recurring: booking.recurring || false,
          frequency: booking.frequency,
          recurringEndDate: booking.recurringEndDate?.split('T')[0],
          daysOfWeek: booking.daysOfWeek || [],
          createdAt: booking.createdTime
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error("Error fetching past bookings:", error);
        setBookings([]);
      }
    };

    if (currentUser) {
      fetchPastBookings();
    }
  }, [currentUser]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  function calculateDuration(start: string, end: string) {
    if (!start || !end) return "-";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  }

  const isOrganizer = (booking: Booking) => {
    return booking.organizer === currentUser;
  };

  // Helper function to get participants excluding current user
  const getDisplayParticipants = (booking: Booking) => {
    return (booking.participants || [])
      .filter(p => p != null && typeof p === 'string' && p !== currentUser);
  };

  return (
    <>
      <div className="past-bookings-container">
        <Header />
        <h1 className="past-bookings-title">Past Bookings</h1>
        <div className="past-tabs">
          <Link to="/upcoming" className="past-tab-button">Upcoming</Link>
          <Link to="/past" className="past-tab-button active">Past</Link>
        </div>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No past bookings</h3>
            <p>You don't have any past meetings to display.</p>
          </div>
        ) : (
          <div className="past-bookings-list">
            {currentBookings.map((booking) => {
              const displayParticipants = getDisplayParticipants(booking);
              
              return (
                <div key={booking.id} className="past-booking-card">
                  <img 
                    src={booking.image || "/assets/meeting-room1.jpg"} 
                    alt={booking.roomName} 
                    className="past-room-image"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/meeting-room1.jpg";
                    }}
                  />
                  <div className="past-booking-details">
                    <h3>
                      <span className="past-booking-details-label">Room Name:</span> {booking.roomName}
                      {!isOrganizer(booking) && (
                        <span style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#e6ccb2', 
                          color: '#64442F', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          marginLeft: '10px' 
                        }}>
                          Invited
                        </span>
                      )}
                      {booking.recurring && (
                        <span style={{ 
                          fontSize: '12px', 
                          backgroundColor: '#d4edda', 
                          color: '#155724', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          marginLeft: '10px' 
                        }}>
                          Recurring
                        </span>
                      )}
                    </h3>
                    <div className="past-booking-details-row">
                      <p>
                        <span className="past-booking-details-label">Date: </span> 
                        {booking.date ? formatDate(booking.date) : (booking.createdAt ? formatDate(booking.createdAt) : "No date")}
                      </p>
                      {booking.recurring && booking.recurringEndDate && (
                        <p>
                          <span className="past-booking-details-label">Ended: </span> 
                          {formatDate(booking.recurringEndDate)}
                        </p>
                      )}
                      <p className="past-booking-details-column">
                        <span className="past-booking-details-label">Organizer: </span> 
                        {booking.organizer || "Unknown"}
                      </p>
                    </div>
                    <div className="past-booking-details-row">
                      <p>
                        <span className="past-booking-details-label">Time: </span> 
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="past-booking-details-column">
                        <span className="past-booking-details-label">Duration: </span> 
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    {booking.recurring && booking.frequency && (
                      <div className="past-booking-details-row">
                        <p>
                          <span className="past-booking-details-label">Frequency: </span> 
                          {booking.frequency}
                        </p>
                        {booking.frequency === 'weekly' && booking.daysOfWeek && booking.daysOfWeek.length > 0 && (
                          <p>
                            <span className="past-booking-details-label">Days: </span> 
                            {booking.daysOfWeek.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="past-booking-details-row">
                      <p>
                        <span className="past-booking-details-label">Purpose: </span> 
                        {booking.purpose || "-"}
                      </p>
                    </div>
                    <div className="past-booking-details-row">
                      <p>
                        <span className="past-booking-details-label">Participants: </span> 
                        {displayParticipants.length > 0 ? displayParticipants.join(", ") : "No other participants"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </>
  );
};