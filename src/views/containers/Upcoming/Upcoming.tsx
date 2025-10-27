import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Upcoming.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Booking = {
  id: string;
  roomName: string;
  floor?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  participants?: string[];
  organizer?: string; // Added organizer field
  image?: string;
  recurring?: boolean;
  frequency?: string;
  recurringEndDate?: string;
  daysOfWeek?: string[];
  createdAt?: string;
};

export const Upcoming = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const getCurrentUser = () => {
    const username = localStorage.getItem("username");
    return username || "Current User";
  };

  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 3;

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const currentUser = getCurrentUser();

  useEffect(() => {
    const currentUser = getCurrentUser();
    console.log("Fetching bookings for user:", currentUser);
    
    // Fetch bookings and filter for current user
    fetch("http://localhost:3000/bookings")
      .then((response) => response.json())
      .then((data) => {
        console.log("All bookings fetched:", data);
        
        // Filter bookings where user is organizer or participant
        const userBookings = data.filter((booking: Booking) => {
          const isOrganizer = booking.organizer === currentUser;
          const isParticipant = booking.participants?.includes(currentUser);
          console.log(`Booking ${booking.id}: organizer=${booking.organizer}, participants=${booking.participants}, isOrganizer=${isOrganizer}, isParticipant=${isParticipant}`);
          return isOrganizer || isParticipant;
        });
        
        console.log("User bookings:", userBookings);
        
        // Filter for upcoming bookings only
        const now = new Date();
        const upcomingBookings = userBookings.filter((booking: Booking) => {
          if (!booking.date) return false;
          const bookingDate = new Date(booking.date + 'T' + (booking.startTime || '00:00'));
          const isUpcoming = bookingDate >= now;
          console.log(`Booking ${booking.id}: date=${booking.date}, time=${booking.startTime}, isUpcoming=${isUpcoming}`);
          return isUpcoming;
        });
        
        console.log("Upcoming bookings:", upcomingBookings);
        setBookings(upcomingBookings);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
      
    // Fetch participants list
    fetch("http://localhost:3000/participants")
      .then((response) => response.json())
      .then((data) => {
        const validParticipants = (data || [])
          .filter((p: any) => p && p.name && typeof p.name === 'string')
          .map((p: any) => p.name);
        setParticipants(validParticipants);
      })
      .catch((error) => {
        console.error("Error fetching participants:", error);
      });
  }, [currentUser]);

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({ ...booking, daysOfWeek: booking.daysOfWeek || [] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setEditForm({});
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditParticipants = (value: string) => {
    if (!editForm.participants?.includes(value)) {
      setEditForm((prev) => ({
        ...prev,
        participants: prev.participants ? [...prev.participants, value] : [value],
      }));
    }
    setSearchTerm("");
  };

  const handleRemoveEditParticipant = (value: string) => {
    setEditForm((prev) => ({
      ...prev,
      participants: prev.participants?.filter((p) => p !== value) || [],
    }));
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    try {
      await fetch(`http://localhost:3000/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      
      // Refresh bookings
      const response = await fetch("http://localhost:3000/bookings");
      const data = await response.json();
      const userBookings = data.filter((booking: Booking) => 
        booking.organizer === currentUser || 
        booking.participants?.includes(currentUser)
      );
      
      const now = new Date();
      const upcomingBookings = userBookings.filter((booking: Booking) => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date + 'T' + (booking.startTime || '00:00'));
        return bookingDate >= now;
      });
      
      setBookings(upcomingBookings);
      closeModal();
      alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking. Please try again.");
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await fetch(`http://localhost:3000/bookings/${bookingId}`, {
          method: "DELETE",
        });
        
        // Refresh bookings
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

const filteredParticipants = participants
  .filter((p): p is string => p != null && typeof p === 'string')
  .filter((participant) => {
    const term = (searchTerm || "").toLowerCase();
    return participant.toLowerCase().includes(term) &&
           !editForm.participants?.some(p => p === participant);
  });
  
  function calculateDuration(start: string, end: string) {
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
      <div className="upcoming-bookings-container">
        <Header />
        <h1 className="upcoming-bookings-title">Manage Bookings</h1>
        <div className="upcoming-tabs">
          <Link to="/upcoming" className="upcoming-tab-button active">Upcoming</Link>
          <Link to="/past" className="upcoming-tab-button">Past</Link>
        </div>
        
        {bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <h3>No upcoming bookings</h3>
            <p>You don't have any upcoming meetings at the moment.</p>
          </div>
        ) : (
          <div className="upcoming-bookings-list">
            {currentBookings.map((booking) => {
              const displayParticipants = getDisplayParticipants(booking);
              
              return (
                <div key={booking.id} className="upcoming-booking-card">
                  <img src={booking.image || "/assets/meeting-room1.jpg"} alt={booking.roomName} className="upcoming-room-image" />
                  <div className="upcoming-booking-details">
                    <h3>
                      <span className="upcoming-booking-details-label">Room Name:</span> {booking.roomName}
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
                    <div className="upcoming-booking-details-row">
                      <p><span className="upcoming-booking-details-label">Date:</span> {booking.date ? formatDate(booking.date) : booking.createdAt?.slice(0,10)}</p>
                      {booking.recurring && booking.recurringEndDate && (
                        <p><span className="upcoming-booking-details-label">Ends:</span> {formatDate(booking.recurringEndDate)}</p>
                      )}
                      <p className="upcoming-booking-details-column">
                        <span className="upcoming-booking-details-label">Organizer:</span> {booking.organizer || "Unknown"}
                      </p>
                    </div>
                    <div className="upcoming-booking-details-row">
                      <p><span className="upcoming-booking-details-label">Time:</span> {booking.startTime} - {booking.endTime}</p>
                      <p className="upcoming-booking-details-column">
                        <span className="upcoming-booking-details-label">Duration:</span> {booking.startTime && booking.endTime ? calculateDuration(booking.startTime, booking.endTime) : "-"}
                      </p>
                    </div>
                    {booking.recurring && booking.frequency && (
                      <div className="upcoming-booking-details-row">
                        <p><span className="upcoming-booking-details-label">Frequency:</span> {booking.frequency}</p>
                        {booking.frequency === 'weekly' && booking.daysOfWeek && booking.daysOfWeek.length > 0 && (
                          <p><span className="upcoming-booking-details-label">Days:</span> {booking.daysOfWeek.join(', ')}</p>
                        )}
                      </div>
                    )}
                    <div className="upcoming-booking-details-row">
                      <p><span className="upcoming-booking-details-label">Purpose:</span> {booking.purpose || "-"}</p>
                    </div>
                    <div className="upcoming-booking-details-row">
                      <p><span className="upcoming-booking-details-label">Participants:</span> {displayParticipants.length > 0 ? displayParticipants.join(", ") : "No other participants"}</p>
                    </div>
                  </div>
                  <div className="upcoming-booking-actions">
                    {isOrganizer(booking) ? (
                      <>
                        <button className="upcoming-edit-button" onClick={() => openModal(booking)}>Edit</button>
                        <button 
                          className="upcoming-cancel-button" 
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      </>
                    ) : (
                      <button 
                        className="upcoming-cancel-button" 
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ backgroundColor: '#ff6b6b' }}
                      >
                        Leave Meeting
                      </button>
                    )}
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
      
      {/* Edit Modal */}
      {isModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <form className="modal-form" onSubmit={handleUpdateBooking}>
              <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Edit Booking</h2>
              <div className="row">
                <div>
                  <label>Floor Number:
                    <input
                      name="floor"
                      type="text"
                      value={editForm.floor || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>Room Name:
                    <input
                      name="roomName"
                      type="text"
                      value={editForm.roomName || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>Date:
                    <input
                      name="date"
                      type="date"
                      value={editForm.date || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                </div>
                <div>
                  <label>Start Time:
                    <input
                      name="startTime"
                      type="time"
                      value={editForm.startTime || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                  <label>End Time:
                    <input
                      name="endTime"
                      type="time"
                      value={editForm.endTime || ""}
                      onChange={handleEditChange}
                    />
                  </label>
                </div>
              </div>
              <label>Purpose of the Booking:
                <input
                  name="purpose"
                  type="text"
                  value={editForm.purpose || ""}
                  onChange={handleEditChange}
                />
              </label>
              <label>Add Participants:
                <div className="participant-input" style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && filteredParticipants.length > 0 && (
                    <div className="participant-list" style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      zIndex: 1000
                    }}>
                      {filteredParticipants.map((participant, index) => (
                        <div 
                          key={index} 
                          onClick={() => handleEditParticipants(participant)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          {participant}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="selected-participants">
                  {editForm.participants
                    ?.filter(p => p != null && typeof p === 'string')
                    .map((participant, index) => (
                      <div key={index} className="selected-participant">
                        {participant}
                        <span onClick={() => handleRemoveEditParticipant(participant)}>x</span>
                      </div>
                    ))
                  }
                </div>
              </label>
              
              <div className="recurring-section">
                <label style={{ fontWeight: 600, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!editForm.recurring}
                    onChange={e => setEditForm(prev => ({ ...prev, recurring: e.target.checked }))}
                    style={{ marginRight: 8 }}
                  />
                  Make Recurring
                </label>
                {editForm.recurring && (
                  <div style={{ marginTop: 10 }}>
                    <label>Frequency:
                      <select
                        name="frequency"
                        value={editForm.frequency || ""}
                        onChange={handleEditChange}
                      >
                        <option value="">Select</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </label>
                    <label>Recurring End Date:
                      <input
                        name="recurringEndDate"
                        type="date"
                        value={editForm.recurringEndDate || ""}
                        onChange={handleEditChange}
                      />
                    </label>
                    {editForm.frequency === 'weekly' && (
                      <label style={{ display: 'block', marginTop: 8 }}>
                        Days of Week:
                        <div className="days-of-week">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                            <label key={day} style={{ fontWeight: 400 }}>
                              <input
                                type="checkbox"
                                checked={editForm.daysOfWeek?.includes(day) || false}
                                onChange={e => {
                                  const days = editForm.daysOfWeek || [];
                                  setEditForm(prev => ({
                                    ...prev,
                                    daysOfWeek: e.target.checked
                                      ? [...days, day]
                                      : days.filter(d => d !== day),
                                  }));
                                }}
                              />
                              {day}
                            </label>
                          ))}
                        </div>
                      </label>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button className="cancel-button" type="button" onClick={closeModal}>Cancel</button>
                <button className="update-button" type="submit">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};