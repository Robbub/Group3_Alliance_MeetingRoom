import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./AddRecurringModal.css";

interface AddRecurringModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    roomName: "",
    frequency: "",
    daysOfWeek: "",
    startTime: "09:00",
    duration: "1 hour",
    purpose: "",
    organizer: "",
    participants: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    
    // Set organizer from session storage
    const username = sessionStorage.getItem("username");
    if (username) {
      setFormData(prev => ({ ...prev, organizer: username }));
    }
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:64508/api/Room/GetRooms");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.roomName || !formData.startTime || !formData.purpose || !formData.frequency || !formData.daysOfWeek) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    
    try {
      // Convert duration to endTime
      const durationHours = parseInt(formData.duration) || 1;
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

      const payload = {
        roomName: formData.roomName,
        frequency: formData.frequency,
        daysOfWeek: formData.daysOfWeek,
        startTime: formData.startTime,
        endTime: endTime,
        purpose: formData.purpose,
        organizer: formData.organizer,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      const response = await fetch("http://localhost:64508/api/Booking/CreateRecurringMeeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || "Recurring meeting created successfully!");
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.message || "Failed to create recurring meeting");
      }
    } catch (error) {
      console.error("Error creating recurring meeting:", error);
      alert("Error creating recurring meeting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getDayOptions = () => {
    if (formData.frequency === "Monthly") {
      return [
        { value: "First Monday", label: "First Monday" },
        { value: "First Tuesday", label: "First Tuesday" },
        { value: "First Wednesday", label: "First Wednesday" },
        { value: "First Thursday", label: "First Thursday" },
        { value: "First Friday", label: "First Friday" },
        { value: "Last Monday", label: "Last Monday" },
        { value: "Last Tuesday", label: "Last Tuesday" },
        { value: "Last Wednesday", label: "Last Wednesday" },
        { value: "Last Thursday", label: "Last Thursday" },
        { value: "Last Friday", label: "Last Friday" },
      ];
    } else {
      return [
        { value: "Monday", label: "Monday" },
        { value: "Tuesday", label: "Tuesday" },
        { value: "Wednesday", label: "Wednesday" },
        { value: "Thursday", label: "Thursday" },
        { value: "Friday", label: "Friday" },
      ];
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="recurring-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="recurring-modal-header">
          <div>
            <h2>Add Recurring Meeting</h2>
            <p className="modal-subtitle">Create a new recurring meeting schedule. Fill in all the details below.</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="recurring-form">
          <div className="form-row full-width">
            <div className="form-group">
              <label>
                Meeting Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g., Weekly Team Sync"
                required
              />
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label>
                Room <span className="required">*</span>
              </label>
              <select
                name="roomName"
                value={formData.roomName}
                onChange={handleChange}
                required
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomName}>
                    {room.roomName} - {room.floorNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label>
                Organizer <span className="required">*</span>
              </label>
              <input
                type="text"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Frequency <span className="required">*</span>
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
              >
                <option value="">Select frequency</option>
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Day <span className="required">*</span>
              </label>
              <select
                name="daysOfWeek"
                value={formData.daysOfWeek}
                onChange={handleChange}
                required
              >
                <option value="">Select day</option>
                {getDayOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                Time <span className="required">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Duration <span className="required">*</span>
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              >
                <option value="">Select duration</option>
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
                <option value="2.5">2.5 hours</option>
                <option value="3">3 hours</option>
              </select>
            </div>
          </div>

          <div className="form-row full-width">
            <div className="form-group">
              <label>
                Expected Participants
              </label>
              <input
                type="text"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                placeholder="e.g., 10"
              />
            </div>
          </div>
        </form>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="submit-btn" 
            disabled={loading} 
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
};
