import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Upcoming.css";
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

export const Upcoming = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Fetch upcoming bookings from backend
  useEffect(() => {
    const fetchUpcomingBookings = async () => {
      try {
        const response = await fetch(`https://localhost:3150/api/Booking/GetUpcomingBookings/${currentUser}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch upcoming bookings: ${response.status}`);
        }
        const data: Booking[] = await response.json();
        console.log("Fetched upcoming bookings:", data);
        
        // Transform backend data to frontend format
        const transformedBookings = data.map((booking: any) => ({
          id: booking.id,
          roomId: booking.roomId,
          roomName: booking.roomName,
          floor: booking.floor,
          date: booking.date.split('T')[0], 
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
        console.error("Error fetching upcoming bookings:", error);
        setBookings([]);
      }
    };

    if (currentUser) {
      fetchUpcomingBookings();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        console.log("Fetching participants...");
        const response = await fetch("https://localhost:3150/api/Booking/GetAvailableParticipants");
        if (response.ok) {
          const participantsData = await response.json();
          console.log("Fetched participants:", participantsData);
          
          // Extract names from the response
          const participantNames = participantsData.map((user: any) => 
            user.name || user.Name || user.userId || user.UserId || user.userName || `${user.firstName} ${user.lastName}`.trim()
          ).filter((name: string) => name && name !== 'undefined undefined');
          
          console.log("Processed participant names:", participantNames);
          setParticipants(participantNames);
        } else {
          console.error("Failed to fetch participants:", response.status);
          // Set fallback participants
          setParticipants(["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Wilson"]);
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
        // Set fallback participants
        setParticipants(["John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", "Charlie Wilson"]);
      }
    };

    fetchParticipants();
  }, []);

  const openModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setEditForm({ ...booking, daysOfWeek: booking.daysOfWeek || [] });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
    setEditForm({});
    setSearchTerm("");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No date";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
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
      // Make sure current user is always included as organizer
      const currentUser = getCurrentUser();
      const allParticipants = editForm.participants?.filter(p => p != null && typeof p === 'string' && p.trim() !== '') || [];
      
      // Ensure organizer is in participants list
      if (!allParticipants.includes(currentUser)) {
        allParticipants.unshift(currentUser);
      }

      console.log("All participants to be saved:", allParticipants);

      const updateData = {
        RoomId: selectedBooking.roomId,
        RoomName: editForm.roomName || selectedBooking.roomName,
        Floor: selectedBooking.floor,
        Date: editForm.date,
        StartTime: editForm.startTime,
        EndTime: editForm.endTime,
        Purpose: editForm.purpose,
        Organizer: selectedBooking.organizer,
        Recurring: editForm.recurring || false,
        Frequency: editForm.frequency || null,
        RecurringEndDate: editForm.recurringEndDate || null,
        DaysOfWeek: editForm.daysOfWeek || null,
        Image: selectedBooking.image,
        Participants: allParticipants 
      };

      console.log("Updating booking with data:", updateData); 

      const response = await fetch(`https://localhost:3150/api/Booking/UpdateBooking/${selectedBooking.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Update booking error response:", errorText);
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log("Update booking success response:", result);
      
      // Refresh bookings from backend
      const refreshResponse = await fetch(`https://localhost:3150/api/Booking/GetUpcomingBookings/${currentUser}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log("Refreshed bookings data:", data);
        
        const transformedBookings = data.map((booking: any) => ({
          id: booking.id,
          roomId: booking.roomId,
          roomName: booking.roomName,
          floor: booking.floor,
          date: booking.date.split('T')[0],
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose || "",
          participants: booking.participants?.map((p: any) => p.name || p.Name || p.userId || p.UserId || p) || [],
          organizer: booking.organizer,
          image: booking.image || "/assets/meeting-room1.jpg",
          recurring: booking.recurring || false,
          frequency: booking.frequency,
          recurringEndDate: booking.recurringEndDate?.split('T')[0],
          daysOfWeek: booking.daysOfWeek || [],
          createdAt: booking.createdTime
        }));
        
        console.log("Transformed bookings:", transformedBookings);
        setBookings(transformedBookings);
      }
      
      closeModal();
      alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert(`Failed to update booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        const response = await fetch(`https://localhost:3150/api/Booking/DeleteBooking/${bookingId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete booking');
        }
        
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        alert("Booking cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling booking:", error);
        alert(`Failed to cancel booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      .filter(p => p != null && typeof p === 'string' && p !== currentUser && p.trim() !== '');
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
                  <img 
                    src={booking.image || "/assets/meeting-room1.jpg"} 
                    alt={booking.roomName} 
                    className="upcoming-room-image"
                    onError={(e) => {
                      e.currentTarget.src = "/assets/meeting-room1.jpg";
                    }}
                  />
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
                      <p>
                        <span className="upcoming-booking-details-label">Date: </span> 
                        {booking.date ? formatDate(booking.date) : (booking.createdAt ? formatDate(booking.createdAt) : "No date")}
                      </p>
                      {booking.recurring && booking.recurringEndDate && (
                        <p>
                          <span className="upcoming-booking-details-label">Ends: </span> 
                          {formatDate(booking.recurringEndDate)}
                        </p>
                      )}
                      <p className="upcoming-booking-details-column">
                        <span className="upcoming-booking-details-label">Organizer: </span> 
                        {booking.organizer || "Unknown"}
                      </p>
                    </div>
                    <div className="upcoming-booking-details-row">
                      <p>
                        <span className="upcoming-booking-details-label">Time: </span> 
                        {booking.startTime} - {booking.endTime}
                      </p>
                      <p className="upcoming-booking-details-column">
                        <span className="upcoming-booking-details-label">Duration: </span> 
                        {calculateDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    {booking.recurring && booking.frequency && (
                      <div className="upcoming-booking-details-row">
                        <p>
                          <span className="upcoming-booking-details-label">Frequency: </span> 
                          {booking.frequency}
                        </p>
                        {booking.frequency === 'weekly' && booking.daysOfWeek && booking.daysOfWeek.length > 0 && (
                          <p>
                            <span className="upcoming-booking-details-label">Days: </span> 
                            {booking.daysOfWeek.join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="upcoming-booking-details-row">
                      <p>
                        <span className="upcoming-booking-details-label">Purpose: </span> 
                        {booking.purpose || "-"}
                      </p>
                    </div>
                    <div className="upcoming-booking-details-row">
                      <p>
                        <span className="upcoming-booking-details-label">Participants: </span> 
                        {displayParticipants.length > 0 ? displayParticipants.join(", ") : "No other participants"}
                      </p>
                    </div>
                  </div>
                  <div className="upcoming-booking-actions">
                    {isOrganizer(booking) ? (
                      <>
                        <button className="upcoming-edit-button" onClick={() => openModal(booking)}>
                          Edit
                        </button>
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
                  <label>Room Name:
                    <input
                      name="roomName"
                      type="text"
                      value={editForm.roomName || ""}
                      onChange={handleEditChange}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                      title="Room cannot be changed after booking"
                    />
                  </label>
                  <label>Date:
                    <input
                      name="date"
                      type="date"
                      value={editForm.date || ""}
                      onChange={handleEditChange}
                      required
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
                      required
                    />
                  </label>
                  <label>End Time:
                    <input
                      name="endTime"
                      type="time"
                      value={editForm.endTime || ""}
                      onChange={handleEditChange}
                      required
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
                  placeholder="Enter the purpose of this meeting"
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
                        <span onClick={() => handleRemoveEditParticipant(participant)}>×</span>
                      </div>
                    ))
                  }
                </div>
              </label>
              
              <div className="recurring-section">
                <label style={{ fontWeight: 600, marginBottom: 8 }}>
                  <input
                    name="recurring"
                    type="checkbox"
                    checked={!!editForm.recurring}
                    onChange={handleEditChange}
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
                        required={editForm.recurring}
                      >
                        <option value="">Select Frequency</option>
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
                        min={editForm.date}
                        required={editForm.recurring}
                      />
                    </label>
                    {editForm.frequency === 'weekly' && (
                      <label style={{ display: 'block', marginTop: 8 }}>
                        Days of Week:
                        <div className="days-of-week" style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                            <label key={day} style={{ fontWeight: 400, display: 'flex', alignItems: 'center' }}>
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
                                style={{ marginRight: '5px' }}
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
              <div className="modal-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="cancel-button" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="update-button" type="submit">
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};