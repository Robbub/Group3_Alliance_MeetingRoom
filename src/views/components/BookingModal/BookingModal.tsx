import React, { useState } from "react";
import "./BookingModal.css";

type Room = {
  id: number;
  name: string;
  floor: string;
  image: string;
  amenities: string[];
  capacity: number;
};

interface BookingModalProps {
  room: Room;
  onClose: (goBackToPreview: boolean) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, onClose }) => {
  const [formData, setFormData] = useState({
    floor: room.floor,
    roomName: room.name,
    date: "",
    timeSlot: "",
    recurring: false,
    purpose: "",
    participantInput: "",
    participants: [] as string[],
  });

  const addParticipant = () => {
    if (
      formData.participantInput &&
      !formData.participants.includes(formData.participantInput)
    ) {
      setFormData({
        ...formData,
        participants: [...formData.participants, formData.participantInput],
        participantInput: "",
      });
    }
  };

  const removeParticipant = (name: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== name),
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Booking submitted:", formData);
    alert("Booking submitted!");
    onClose(false);
  };

  return (
    <div className="booking-modal-overlay" onClick={() => onClose(true)}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Booking Details</h2>

        <form className="booking-form" onSubmit={handleSubmit}>
          {/* Floor Number */}
          <div className="form-group full-width">
            <label>Floor Number</label>
            <select
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            >
              <option value="17th">17th</option>
              <option value="18th">18th</option>
              <option value="19th">19th</option>
            </select>
          </div>

          {/* Room Name */}
          <div className="form-group full-width">
            <label>Room Name</label>
            <select
              value={formData.roomName}
              onChange={(e) =>
                setFormData({ ...formData, roomName: e.target.value })
              }
            >
              <option value="Boardroom 1">Boardroom 1</option>
              <option value="Boardroom 2">Boardroom 2</option>
              <option value="Boardroom 3">Boardroom 3</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={(e) =>
                  setFormData({ ...formData, timeSlot: e.target.value })
                }
              >
                <option value="">00:00 - 00:00</option>
                <option>08:00 - 10:00</option>
                <option>10:00 - 12:00</option>
                <option>13:00 - 15:00</option>
                <option>15:00 - 17:00</option>
              </select>
            </div>
          </div>

          {/* Purpose & Participants */}
          <div className="form-row">
            <div className="form-group">
              <label>Purpose of the booking</label>
              <input
                type="text"
                placeholder="Text"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Add Participants</label>
              <div className="participant-input">
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.participantInput}
                  onChange={(e) =>
                    setFormData({ ...formData, participantInput: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addParticipant())}
                />
                <div className="selected-participants">
                  {formData.participants.map((p, idx) => (
                    <span className="participant-tag" key={idx}>
                      {p} <span onClick={() => removeParticipant(p)}>×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recurring + Actions */}
          <div className="footer-row">
            <div className="recurring-toggle">
              🔁 Make Recurring
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) =>
                  setFormData({ ...formData, recurring: e.target.checked })
                }
              />
            </div>
            <div className="booking-modal-actions">
              <button type="button" className="cancel-btn" onClick={() => onClose(true)}>
                Cancel
              </button>
              <button type="submit" className="book-btn">
                Book
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
