import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Upcoming.css";

type Booking = {
  id: string;
  roomName: string;
  floor?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  purpose?: string;
  participants?: string[];
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

  useEffect(() => {
    fetch("http://localhost:3000/bookings")
      .then((response) => response.json())
      .then((data) => setBookings(data));
    fetch("/db.json")
      .then((response) => response.json())
      .then((data) => setParticipants(data.participants?.map((p: any) => p.name) || []));
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
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditParticipants = (value: string) => {
    setEditForm((prev) => ({
      ...prev,
      participants: prev.participants ? [...prev.participants, value] : [value],
    }));
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
    await fetch(`http://localhost:3000/bookings/${selectedBooking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    // Refresh bookings
    const updated = await fetch("http://localhost:3000/bookings").then((r) => r.json());
    setBookings(updated);
    closeModal();
  };

  const filteredParticipants = participants.filter((participant) =>
    participant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function calculateDuration(start: string, end: string) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m`;
  }

  return (
    <>
      <div className="upcoming-bookings-container">
        <Header />
        <h1 className="upcoming-bookings-title">Manage Bookings</h1>
        <div className="upcoming-tabs">
          <Link to="/upcoming" className="upcoming-tab-button active">Upcoming</Link>
          <Link to="/past" className="upcoming-tab-button">Past</Link>
        </div>
        <div className="upcoming-bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="upcoming-booking-card">
              <img src={booking.image || "/assets/meeting-room1.jpg"} alt={booking.roomName} className="upcoming-room-image" />
              <div className="upcoming-booking-details">
                <h3><span className="upcoming-booking-details-label">Room Name:</span> {booking.roomName}</h3>
                <div className="upcoming-booking-details-row">
                  <p><span className="upcoming-booking-details-label">Check In:</span> {booking.date || booking.createdAt?.slice(0,10)}</p>
                  <p className="upcoming-booking-details-column"><span className="upcoming-booking-details-label">Guests:</span> {booking.participants?.join(", ") || "-"}</p>
                </div>
                <div className="upcoming-booking-details-row">
                  <p><span className="upcoming-booking-details-label">Time:</span> {booking.startTime} - {booking.endTime}</p>
                  <p className="upcoming-booking-details-column"><span className="upcoming-booking-details-label">Duration:</span> {booking.startTime && booking.endTime ? calculateDuration(booking.startTime, booking.endTime) : "-"}</p>
                </div>
                <div className="upcoming-booking-details-row">
                  <p><span className="upcoming-booking-details-label">Purpose:</span> {booking.purpose || "-"}</p>
                </div>
              </div>
              <div className="upcoming-booking-actions">
                <button className="upcoming-edit-button" onClick={() => openModal(booking)}>Edit</button>
                <button className="upcoming-cancel-button">Cancel Booking</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && selectedBooking && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
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
                <div className="participant-input">
                  <input
                    type="text"
                    placeholder="Search participants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="participant-list">
                      {filteredParticipants.map((participant, index) => (
                        <div key={index} onClick={() => handleEditParticipants(participant)}>
                          {participant}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="selected-participants">
                  {editForm.participants?.map((participant, index) => (
                    <div key={index} className="selected-participant">
                      {participant}
                      <span onClick={() => handleRemoveEditParticipant(participant)}>x</span>
                    </div>
                  ))}
                </div>
              </label>
              {/* Recurring Booking Section */}
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
