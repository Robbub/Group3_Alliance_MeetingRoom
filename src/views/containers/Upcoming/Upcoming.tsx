import React, { useState, useEffect } from "react";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Upcoming.css";

export const Upcoming = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  const bookings = [
    {
      id: 1,
      roomName: "4th Floor - N Wing",
      checkIn: "12 Mar 2025",
      time: "1:00 PM - 4:00 PM",
      guests: "15 people",
      duration: "3 hours",
      image: "/assets/meeting-room1.jpg",
    },
    {
      id: 2,
      roomName: "4th Floor - N Wing",
      checkIn: "12 Mar 2025",
      time: "1:00 PM - 4:00 PM",
      guests: "15 people",
      duration: "3 hours",
      image: "/assets/meeting-room2.jpg",
    },
    {
      id: 3,
      roomName: "4th Floor - N Wing",
      checkIn: "12 Mar 2025",
      time: "1:00 PM - 4:00 PM",
      guests: "15 people",
      duration: "3 hours",
      image: "/assets/meeting-room3.jpg",
    },
  ];

  useEffect(() => {
    // Fetch participants from db.json
    fetch("/db.json")
      .then((response) => response.json())
      .then((data) => setParticipants(data.participants || []));
  }, []);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const addParticipant = (participant) => {
    if (!selectedParticipants.includes(participant)) {
      setSelectedParticipants([...selectedParticipants, participant]);
    }
  };

  const removeParticipant = (participant) => {
    setSelectedParticipants(selectedParticipants.filter((p) => p !== participant));
  };

  const filteredParticipants = participants.filter((participant) =>
    participant.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="upcoming-bookings-container">
        <Header />
        <h1 className="upcoming-bookings-title">Manage Bookings</h1>
        <div className="upcoming-tabs">
          <button className="upcoming-tab-button active">
            <a href="/upcoming">Upcoming</a>
          </button>
          <button className="upcoming-tab-button">
            <a href="/past">Past</a>
          </button>
        </div>
        <div className="upcoming-bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="upcoming-booking-card">
              <img src={booking.image} alt={booking.roomName} className="upcoming-room-image" />
              <div className="upcoming-booking-details">
                <h3><span className="upcoming-booking-details-label">Room Name:</span> {booking.roomName}</h3>
                <div className="upcoming-booking-details-row">
                  <p><span className="upcoming-booking-details-label">Check In:</span> {booking.checkIn}</p>
                  <p className="upcoming-booking-details-column"><span className="upcoming-booking-details-label">Guests:</span> {booking.guests}</p>
                </div>
                <div className="upcoming-booking-details-row">
                  <p><span className="upcoming-booking-details-label">Time:</span> {booking.time}</p>
                  <p className="upcoming-booking-details-column"><span className="upcoming-booking-details-label">Duration:</span> {booking.duration}</p>
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
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            {selectedBooking && (
              <>
                {/* <div className="modal-header">
                  <h2>Booking Details</h2>
                </div> */}
                <form className="modal-form">
                  <label>
                    Floor Number:
                    <select defaultValue="17th">
                      <option value="17th">17th</option>
                      <option value="18th">18th</option>
                      <option value="19th">19th</option>
                    </select>
                  </label>

                  <label>
                    Room Name:
                    <select defaultValue="BOARDROOM 1">
                      <option value="BOARDROOM 1">BOARDROOM 1</option>
                      <option value="BOARDROOM 2">BOARDROOM 2</option>
                      <option value="BOARDROOM 3">BOARDROOM 3</option>
                    </select>
                  </label>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label>
                      From Date:
                      <input type="date" defaultValue={selectedBooking.checkIn} />
                    </label>
                    <label>
                      Time Slot:
                      <select defaultValue="1:00 PM - 4:00 PM">
                        <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '20px' }}>
                    <label>
                      To Date:
                      <input type="date" defaultValue={selectedBooking.checkIn} />
                    </label>
                    <label>
                      Time Slot:
                      <select defaultValue="1:00 PM - 4:00 PM">
                        <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                        <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM</option>
                      </select>
                    </label>
                  </div>

                  <label>
                    Purpose of the Booking:
                    <input type="text" placeholder="Enter purpose" />
                  </label>

                  <label>
                    Add Participants:
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
                            <div key={index} onClick={() => addParticipant(participant)}>
                              {participant}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="selected-participants">
                      {selectedParticipants.map((participant, index) => (
                        <div key={index} className="selected-participant">
                          {participant}
                          <span onClick={() => removeParticipant(participant)}>x</span>
                        </div>
                      ))}
                    </div>
                  </label>
                </form>
                <div className="modal-actions">
                  <button className="cancel-button" onClick={closeModal}>Cancel</button>
                  <button className="update-button" onClick={closeModal}>Update</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
