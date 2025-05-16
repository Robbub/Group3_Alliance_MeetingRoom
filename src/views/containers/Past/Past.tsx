import React from "react";
import { PATHS } from "../../../constant";
import { Header } from "../../../views/components/Header/Header";
import "./Past.css";

export const Past = () => {
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

  return (
    <>
      <div className="past-bookings-container">
        <Header />
        <h1 className="past-bookings-title">Past Bookings</h1>
        <div className="past-tabs">
          <button className="past-tab-button">
            <a href="/upcoming">Upcoming</a>
          </button>
          <button className="past-tab-button active">
            <a href="/past">Past</a>
          </button>
        </div>
        <div className="past-bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="past-booking-card">
              <img src={booking.image} alt={booking.roomName} className="past-room-image" />
              <div className="past-booking-details">
                <h3><span className="past-booking-details-label">Room Name: </span>{booking.roomName}</h3>
                <div className="past-booking-details-row">
                  <div className="past-booking-details-column">
                    <p><span className="past-booking-details-label">Check In: </span>{booking.checkIn}</p>
                    <p><span className="past-booking-details-label">Guests: </span>{booking.guests}</p>
                  </div>
                  <div className="past-booking-details-column">
                    <p><span className="past-booking-details-label">Time: </span>{booking.time}</p>
                    <p><span className="past-booking-details-label">Duration: </span>{booking.duration}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
