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
    startTime: "",
    endTime: "",
    recurring: false,
    purpose: "",
    participantInput: "",
    participants: [] as string[],
    frequency: "",
    recurringStartDate: "",
    recurringEndDate: "",
    daysOfWeek: [] as string[],
  });

  const [error, setError] = useState<string>("");

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    // Validation
    const date = formData.recurring ? formData.recurringStartDate : formData.date;
    if (!formData.roomName || !formData.floor || !date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.endTime <= formData.startTime) {
      setError("End time must be after start time.");
      return;
    }
    const bookingData = {
      ...formData,
      roomId: room.id,
      roomName: formData.roomName,
      floor: formData.floor,
      date: date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      participants: formData.participants,
      recurring: formData.recurring,
      frequency: formData.frequency,
      recurringEndDate: formData.recurringEndDate,
      daysOfWeek: formData.daysOfWeek,
      createdAt: new Date().toISOString()
    };
    try {
      await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      alert("Booking submitted!");
      onClose(false);
    } catch (err) {
      setError("Failed to save booking.");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Booking Details</h2>

        {error && <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>}

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
                value={formData.recurring ? formData.recurringStartDate : formData.date}
                onChange={(e) =>
                  formData.recurring
                    ? setFormData({ ...formData, recurringStartDate: e.target.value })
                    : setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
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

        {formData.recurring && (
          <div className="recurring-form" style={{ marginTop: 20 }}>
            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.recurringEndDate}
                  min={formData.recurringStartDate}
                  onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                />
              </div>
            </div>
            {formData.frequency === 'weekly' && (
              <div className="form-group">
                <label>Days of Week</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <label key={day} style={{ fontWeight: 400 }}>
                      <input
                        type="checkbox"
                        checked={formData.daysOfWeek?.includes(day) || false}
                        onChange={(e) => {
                          const days = formData.daysOfWeek || [];
                          setFormData({
                            ...formData,
                            daysOfWeek: e.target.checked
                              ? [...days, day]
                              : days.filter((d) => d !== day),
                          });
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
