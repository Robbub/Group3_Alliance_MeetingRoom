import React, { useState, useEffect } from "react";
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
  bookingData?: {
    date: string;
    startTime: string;
    endTime: string;
    purpose: string;
    amenities: string[];
    endDate?: string;
    selectedDates?: string[];
  };
  onClose: (goBackToPreview: boolean) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ room, bookingData, onClose }) => {
  // Helper function to format time with AM/PM
  const formatTimeWithAMPM = (time24: string): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Helper function to detect recurrence pattern
  const detectRecurrencePattern = (): { isRecurring: boolean; frequency: string; endDate: string } => {
    if (!bookingData?.endDate || !bookingData?.date) {
      return { isRecurring: false, frequency: '', endDate: '' };
    }

    const startDate = new Date(bookingData.date);
    const endDate = new Date(bookingData.endDate);
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { isRecurring: false, frequency: '', endDate: '' };
    }

    if (diffDays === 7 || diffDays % 7 === 0) {
      return { isRecurring: true, frequency: 'weekly', endDate: bookingData.endDate };
    }

    if (diffDays >= 28 && diffDays <= 31) {
      return { isRecurring: true, frequency: 'monthly', endDate: bookingData.endDate };
    }

    if (diffDays >= 1 && diffDays <= 6) {
      return { isRecurring: true, frequency: 'daily', endDate: bookingData.endDate };
    }

    if (diffDays % 7 === 0) {
      return { isRecurring: true, frequency: 'weekly', endDate: bookingData.endDate };
    }

    return { isRecurring: true, frequency: 'daily', endDate: bookingData.endDate };
  };

  const recurrencePattern = detectRecurrencePattern();
  type EndType = "date" | "occurrences" | "never";

  const [formData, setFormData] = useState({
    floor: room.floor,
    roomName: room.name,
    date: bookingData?.date || "",
    startTime: bookingData?.startTime || "09:00",
    endTime: bookingData?.endTime || "15:00",
    recurring: recurrencePattern.isRecurring,
    purpose: bookingData?.purpose || "",
    participantInput: "",
    participants: [] as string[],
    frequency: recurrencePattern.frequency,
    recurringStartDate: bookingData?.date || "",
    recurringEndDate: recurrencePattern.endDate,
    daysOfWeek: [] as string[],
    recurInterval: 1,
    endType: (recurrencePattern.endDate ? "date" : "never") as EndType,
    maxOccurrences: 25
  });

  const [error, setError] = useState<string>("");
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);

  // Set initial days of week when frequency changes to weekly
  useEffect(() => {
    if (formData.frequency === 'weekly' && formData.recurringStartDate) {
      const dayOfWeek = getCurrentDayOfWeek();
      setFormData(prev => ({
        ...prev,
        daysOfWeek: [dayOfWeek]
      }));
    }
  }, [formData.frequency, formData.recurringStartDate]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        // Fetch users with 'user' role only (excluding admin and super admin)
        const response = await fetch("https://localhost:3150/api/User/GetUsersByRole/user");
        if (!response.ok) {
          throw new Error(`Failed to fetch participants: ${response.status}`);
        }
        const participantsData = await response.json();
        console.log('Fetched participants:', participantsData);
        
        // Extract names from user objects - use the Name field which combines first and last name
        const participantNames = participantsData
          .filter((user: any) => user.name && user.name.trim()) // Only users with valid names
          .map((user: any) => user.name);
        
        setAvailableParticipants(participantNames);
      } catch (error) {
        console.error("Error fetching participants:", error);
        // Try alternative endpoint as fallback
        try {
          const fallbackResponse = await fetch("https://localhost:3150/api/User/GetAllUsers");
          if (fallbackResponse.ok) {
            const allUsers = await fallbackResponse.json();
            // Filter only users with role "user"
            const userRoleOnly = allUsers.filter((user: any) => user.role === "user");
            const participantNames = userRoleOnly
              .filter((user: any) => user.name && user.name.trim())
              .map((user: any) => user.name);
            setAvailableParticipants(participantNames);
          } else {
            // Final fallback - use some of the actual names from your database
            setAvailableParticipants([
              "jack wang", "admin admin", "superadmin superadmin", 
              "bruce wayne", "Jackson Geneva", "chad wick", "Helena Romance"
            ]);
          }
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          // Use names that match your database structure
          setAvailableParticipants([
            "jack wang", "admin admin", "superadmin superadmin", 
            "bruce wayne", "Jackson Geneva", "chad wick", "Helena Romance"
          ]);
        }
      }
    };

    fetchParticipants();
  }, []);


  // Helper functions
  const calculateDuration = (start: string, end: string): string => {
    if (!start || !end) return '';
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getCurrentDayOfWeek = (): string => {
    const date = new Date(formData.recurringStartDate || formData.date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getCurrentUser = () => {
    // Try to get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        return userObj.username || userObj.name || "Current User";
      } catch (e) {
        // Fallback to username if user object parsing fails
      }
    }
    
    const username = localStorage.getItem("username");
    return username || "Current User";
  };

  const currentUser = getCurrentUser();

  // Filter participants based on search term
  const filteredParticipants = availableParticipants.filter(participant =>
    participant.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !formData.participants.includes(participant)
  );

  const addParticipant = (participant?: string) => {
    const participantToAdd = participant || formData.participantInput;
    if (participantToAdd && !formData.participants.includes(participantToAdd)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, participantToAdd],
        participantInput: "",
      });
      setSearchTerm("");
      setShowParticipantDropdown(false);
    }
  };

  const removeParticipant = (name: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter((p) => p !== name),
    });
  };

  const handleParticipantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, participantInput: value });
    setSearchTerm(value);
    setShowParticipantDropdown(value.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      
      const date = formData.recurring ? formData.recurringStartDate : formData.date;
      if (!formData.roomName || !formData.floor || !date || !formData.startTime || !formData.endTime) {
        setError("Please fill in all required fields.");
        return;
      }
      if (formData.endTime <= formData.startTime) {
        setError("End time must be after start time.");
        return;
      }
      
      const currentUser = getCurrentUser();
      const allParticipants = formData.participants.includes(currentUser) 
        ? formData.participants 
        : [currentUser, ...formData.participants];
      
      // SIMPLE: Just send participant names as strings, NOT UserViewModel objects
      const bookingSubmissionData = {
        RoomId: room.id,
        RoomName: room.name, 
        Floor: room.floor,   
        Date: date,
        StartTime: formData.startTime,
        EndTime: formData.endTime,
        Purpose: formData.purpose || "Meeting",
        Organizer: currentUser,
        Recurring: formData.recurring,
        Frequency: formData.frequency || null,
        RecurringEndDate: formData.recurringEndDate || null,
        DaysOfWeek: formData.daysOfWeek && formData.daysOfWeek.length > 0 
          ? formData.daysOfWeek 
          : null,
        Image: room.image,
        Participants: allParticipants // Just send names as strings
      };
      
      try {
        console.log("Submitting booking data:", bookingSubmissionData);
        
        const response = await fetch("https://localhost:3150/api/Booking/AddBooking", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify(bookingSubmissionData),
        });
        
        const responseText = await response.text();
        console.log("Response status:", response.status);
        console.log("Response text:", responseText);
        
        if (!response.ok) {
          throw new Error(responseText || "Failed to save booking");
        }
        
        alert("Booking submitted successfully!");
        onClose(false);
      } catch (err) {
        console.error("Error saving booking:", err);
        setError(err instanceof Error ? err.message : "Failed to save booking.");
      }
    };

  return (
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Booking Details</h2>

        {error && <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>}

        <form className="booking-form" onSubmit={handleSubmit}>
          {/* Required Amenities Display */}
          {bookingData?.amenities && bookingData.amenities.length > 0 && (
            <div className="form-group full-width">
              <label>Required Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px', background: '#f9f6f2', borderRadius: '6px' }}>
                {bookingData.amenities.map((amenity: string, idx: number) => (
                  <span key={idx} style={{ 
                    background: '#e6ccb2', 
                    padding: '4px 10px', 
                    borderRadius: '16px', 
                    fontSize: '13px', 
                    color: '#64442F',
                    fontWeight: 'bold'
                  }}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Floor Number and Room Name Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Floor Number</label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
              >
                <option value="6th Floor">6th Floor</option>
                <option value="7th Floor">7th Floor</option>
                <option value="8th Floor">8th Floor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Room Name</label>
              <select
                value={formData.roomName}
                onChange={(e) =>
                  setFormData({ ...formData, roomName: e.target.value })
                }
              >
                <option value="Board Room">Board Room</option>
                <option value="Innovation Hub">Innovation Hub</option>
                <option value="Strategy Room">Strategy Room</option>
                <option value="Collaboration Space">Collaboration Space</option>
                <option value="Executive Suite">Executive Suite</option>
              </select>
            </div>
          </div>

          {/* Date (full width) */}
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

          {/* Start Time and End Time Row */}
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

          {/* Purpose (full width) */}
          <div className="form-group">
            <label>Purpose of the booking</label>
            <input
              type="text"
              placeholder="Enter the purpose of this meeting"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
            />
          </div>

          {/* Add Participants (full width) */}
          <div className="form-group">
            <label>Add Participants</label>
            <div className="participant-input" style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search and select participants..."
                value={formData.participantInput}
                onChange={handleParticipantInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addParticipant();
                  }
                }}
                onFocus={() => setShowParticipantDropdown(searchTerm.length > 0)}
                onBlur={() => {
                  // Delay hiding dropdown to allow clicks
                  setTimeout(() => setShowParticipantDropdown(false), 200);
                }}
              />
              
              {/* Participant Dropdown */}
              {showParticipantDropdown && filteredParticipants.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {filteredParticipants.map((participant, index) => (
                    <div
                      key={index}
                      onClick={() => addParticipant(participant)}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderBottom: index < filteredParticipants.length - 1 ? '1px solid #f0f0f0' : 'none',
                        fontSize: '14px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      {participant}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Participants */}
              <div className="selected-participants">
                {formData.participants.map((p, idx) => (
                  <span className="participant-tag" key={idx}>
                    {p} <span onClick={() => removeParticipant(p)}>×</span>
                  </span>
                ))}
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

        {/* Enhanced Recurring Options */}
        {formData.recurring && (
          <div className="recurring-form" style={{ 
            marginTop: 20, 
            padding: '20px', 
            backgroundColor: '#f9f6f2', 
            borderRadius: '8px',
            border: '1px solid #e6ccb2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '18px' }}>🔄</span>
              <h3 style={{ color: '#64442F', margin: 0 }}>Recurrence Details</h3>
            </div>

            {/* Meeting Time Section */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#64442F', fontSize: '14px' }}>Meeting Time</h4>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Start</label>
                  <select 
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      const time24 = `${hour}:00`;
                      const timeFormatted = formatTimeWithAMPM(time24);
                      return (
                        <option key={time24} value={time24}>{timeFormatted}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>End</label>
                  <select 
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = (i + 1).toString().padStart(2, '0');
                      const time24 = `${hour}:00`;
                      const timeFormatted = formatTimeWithAMPM(time24);
                      return (
                        <option key={time24} value={time24}>{timeFormatted}</option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>Duration</label>
                  <div style={{ 
                    padding: '8px 12px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    {calculateDuration(formData.startTime, formData.endTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Recurrence Patterns Section */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#64442F', fontSize: '14px' }}>Recurrence Patterns</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Radio buttons for frequency */}
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={formData.frequency === 'daily'}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value, daysOfWeek: [] })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>Daily</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={formData.frequency === 'weekly'}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value, daysOfWeek: [getCurrentDayOfWeek()] })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>Weekly</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={formData.frequency === 'monthly'}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value, daysOfWeek: [] })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>Monthly</span>
                  </label>
                </div>

                {/* Frequency interval */}
                {formData.frequency && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px' }}>Recur Every</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.recurInterval}
                      onChange={(e) => setFormData({ ...formData, recurInterval: parseInt(e.target.value) })}
                      style={{ 
                        width: '60px', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ccc',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ fontSize: '14px' }}>
                      {formData.frequency === 'daily' ? 'Day(s)' : 
                       formData.frequency === 'weekly' ? 'Week(s) On:' : 
                       'Month(s)'}
                    </span>
                  </div>
                )}

                {/* Days of week for weekly */}
                {formData.frequency === 'weekly' && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {[
                      { short: 'Mon', full: 'Monday' },
                      { short: 'Tue', full: 'Tuesday' },
                      { short: 'Wed', full: 'Wednesday' },
                      { short: 'Thu', full: 'Thursday' },
                      { short: 'Fri', full: 'Friday' },
                      { short: 'Sat', full: 'Saturday' },
                      { short: 'Sun', full: 'Sunday' }
                    ].map((day) => (
                      <label 
                        key={day.short}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.daysOfWeek?.includes(day.short) || false}
                          onChange={(e) => {
                            const days = formData.daysOfWeek || [];
                            setFormData({
                              ...formData,
                              daysOfWeek: e.target.checked
                                ? [...days, day.short]
                                : days.filter((d) => d !== day.short),
                            });
                          }}
                          style={{ accentColor: '#64442F' }}
                        />
                        {day.full}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Range of Recurrence Section */}
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#64442F', fontSize: '14px' }}>Range of Recurrence</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', minWidth: '40px' }}>Start</span>
                  <input
                    type="date"
                    value={formData.recurringStartDate || formData.date}
                    onChange={(e) => setFormData({ ...formData, recurringStartDate: e.target.value })}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="endType"
                      value="date"
                      checked={formData.endType === 'date'}
                      onChange={(e) => setFormData({ ...formData, endType: e.target.value as EndType })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>End by</span>
                    <input
                      type="date"
                      value={formData.recurringEndDate}
                      min={formData.recurringStartDate || formData.date}
                      onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginLeft: '10px' }}
                      disabled={formData.endType !== 'date'}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="endType"
                      value="occurrences"
                      checked={formData.endType === 'occurrences'}
                      onChange={(e) => setFormData({ ...formData, endType: e.target.value as EndType })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>End After</span>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxOccurrences}
                      onChange={(e) => setFormData({ ...formData, maxOccurrences: parseInt(e.target.value) })}
                      style={{ 
                        width: '80px', 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ccc',
                        marginLeft: '10px',
                        marginRight: '10px'
                      }}
                      disabled={formData.endType !== 'occurrences'}
                    />
                    <span style={{ fontSize: '14px' }}>Occurrences</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="endType"
                      value="never"
                      checked={formData.endType === 'never'}
                      onChange={(e) => setFormData({ ...formData, endType: e.target.value as EndType })}
                      style={{ accentColor: '#64442F' }}
                    />
                    <span style={{ fontSize: '14px' }}>No end Date</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recurring: false })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#64442F',
                  border: '2px solid #64442F',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Remove Recurrence
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, recurring: false })}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'white',
                  color: '#64442F',
                  border: '2px solid #64442F',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#64442F',
                  color: 'white',
                  border: '2px solid #64442F',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Okay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;