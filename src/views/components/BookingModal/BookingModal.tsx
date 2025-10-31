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
  const [conflicts, setConflicts] = useState<Array<{id?: any; start: Date; end: Date; reason?: string}>>([]);
  const [availableParticipants, setAvailableParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showParticipantDropdown, setShowParticipantDropdown] = useState(false);

  // Fetch participants from db.json
  useEffect(() => {
    fetch("http://localhost:3000/participants")
      .then((response) => response.json())
      .then((data) => {
        // Handle both array format and object format
        const participantNames = Array.isArray(data) 
          ? data.map((p: any) => p.name || p).filter(name => name && typeof name === 'string')
          : [];
        setAvailableParticipants(participantNames);
      })
      .catch((error) => {
        console.error("Error fetching participants:", error);
        // Fallback participants if server is down
        setAvailableParticipants([
          "John Doe", "Jane Smith", "Alice Johnson", "Bob Brown", 
          "Carol White", "David Wilson", "Emma Davis", "Frank Miller"
        ]);
      });
  }, []);

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
    setConflicts([]);
    
    const date = formData.recurring ? formData.recurringStartDate : formData.date;
    if (!formData.roomName || !formData.floor || !date || !formData.startTime || !formData.endTime) {
      setError("Please fill in all required fields.");
      return;
    }
    if (formData.endTime <= formData.startTime) {
      setError("End time must be after start time.");
      return;
    }
    
    // Get current user
    const currentUser = getCurrentUser();
    console.log("Current user:", currentUser);
    
    // Add current user as organizer if not already in participants
    const allParticipants = formData.participants.includes(currentUser) 
      ? formData.participants 
      : [currentUser, ...formData.participants];
    
    const bookingSubmissionData = {
      roomId: room.id,
      roomName: formData.roomName,
      floor: formData.floor,
      date: date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      participants: allParticipants,
      organizer: currentUser, // Track who created the booking
      recurring: formData.recurring,
      frequency: formData.frequency,
      recurringEndDate: formData.recurringEndDate,
      daysOfWeek: formData.daysOfWeek,
      image: room.image,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Booking data to submit:", bookingSubmissionData);
    
    try {
      // --- Availability checks before submitting ---
  // 1) Fetch existing bookings for the selected room name (use the current Room select value)
  const selectedRoomName = formData.roomName || room.name;
  const bookingsRes = await fetch(`http://localhost:3000/bookings?roomName=${encodeURIComponent(selectedRoomName)}`);
  const existingBookings = bookingsRes.ok ? await bookingsRes.json() : [];

  // 2) Filter out cancelled bookings (if stored with status)
  const activeBookings = existingBookings.filter((b: any) => !b.status || b.status !== 'cancelled');

  // DEBUG: log fetched bookings so we can see what the server returned for this room
  console.debug('Fetched bookings for room', room.id, existingBookings);

      // 3) Configuration: buffer minutes and room capacity from room object (fallbacks)
      const BUFFER_MINUTES = (room as any).bufferMinutes || 15; // configurable per-room
      const bufferMs = BUFFER_MINUTES * 60 * 1000;

      // Helper: check if two ranges overlap considering a buffer (in ms)
      const rangesOverlap = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date, buffer = bufferMs) => {
        const aStartBuff = new Date(aStart.getTime() - buffer);
        const aEndBuff = new Date(aEnd.getTime() + buffer);
        return !(bEnd <= aStartBuff || bStart >= aEndBuff);
      };

      const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

      // Parse date/time helper
      const parseDateTime = (d: string, t: string) => new Date(d + 'T' + t);

      const newStart = parseDateTime(date, formData.startTime);
      const newEnd = parseDateTime(date, formData.endTime);

      // Validate time ordering
      if (newEnd <= newStart) {
        setError('End time must be after start time.');
        return;
      }

      // Capacity check for single instance
      if ((room.capacity || 0) > 0 && allParticipants.length > room.capacity) {
        setError(`Room capacity exceeded (capacity: ${room.capacity}). Remove some participants or choose a bigger room.`);
        return;
      }

      // Check maintenance windows if available on the room (room.maintenance is optional array of {day,start,end})
      try {
        const maintenance = (room as any).maintenance || [];
        for (const m of maintenance) {
          const mDay = typeof m.day === 'string' ? parseInt(m.day) : m.day;
          const bookingDay = newStart.getDay();
          if (mDay === bookingDay) {
            const maintenanceStart = new Date(newStart);
            const [msH, msM] = (m.start || '00:00').split(':').map(Number);
            maintenanceStart.setHours(msH, msM, 0, 0);
            const maintenanceEnd = new Date(newStart);
            const [meH, meM] = (m.end || '00:00').split(':').map(Number);
            maintenanceEnd.setHours(meH, meM, 0, 0);
            if (rangesOverlap(maintenanceStart, maintenanceEnd, newStart, newEnd, 0)) {
              setError('Selected time conflicts with scheduled maintenance.');
              return;
            }
          }
        }
      } catch (e) {
        // ignore malformed maintenance info
      }

      // 4) Check direct overlap for single instance (non-recurring existing bookings)
      for (const b of activeBookings) {
        if (b.recurring) continue; // recurring entries handled below
        const exStart = new Date(b.date + 'T' + (b.startTime || '00:00'));
        const exEnd = new Date(b.date + 'T' + (b.endTime || '00:00'));
        if (!isValidDate(exStart) || !isValidDate(exEnd)) {
          console.warn('Skipping malformed booking dates for', b);
          continue;
        }
        if (rangesOverlap(exStart, exEnd, newStart, newEnd)) {
          console.debug('Conflict with existing single booking', { booking: b, exStart, exEnd, newStart, newEnd });
          setConflicts([{ id: b.id || b.roomId || 'unknown', start: exStart, end: exEnd, reason: 'Existing booking' }]);
          setError('Selected time conflicts with existing booking(s). See details below.');
          return;
        }
      }

      // Helper: generate recurring instances for an existing booking object
      const generateRecurringInstances = (b: any, untilDateStr?: string, maxInstances = 500) => {
        const instances: { start: Date; end: Date }[] = [];
        try {
          if (!b.recurring) return instances;
          const freq = (b.frequency || 'daily').toLowerCase();
          const startDate = new Date(b.date);
          const endDate = b.recurringEndDate ? new Date(b.recurringEndDate) : (untilDateStr ? new Date(untilDateStr) : startDate);
          const daysOfWeek: string[] = Array.isArray(b.daysOfWeek) ? b.daysOfWeek : [];

          let cursor = new Date(startDate);
          let count = 0;
          while (cursor <= endDate && count < maxInstances) {
            if (freq === 'daily') {
              const s = new Date(cursor.toDateString() + 'T' + (b.startTime || '00:00'));
              const e = new Date(cursor.toDateString() + 'T' + (b.endTime || '00:00'));
              instances.push({ start: s, end: e });
              cursor.setDate(cursor.getDate() + 1);
              count++;
            } else if (freq === 'weekly') {
              if (daysOfWeek.length > 0) {
                const weekStart = new Date(cursor);
                for (let d = 0; d < 7 && count < maxInstances; d++) {
                  const day = new Date(weekStart);
                  day.setDate(weekStart.getDate() + d);
                  const shortNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                  const short = shortNames[day.getDay()];
                  if (daysOfWeek.includes(short)) {
                    const s = new Date(day.toDateString() + 'T' + (b.startTime || '00:00'));
                    const e = new Date(day.toDateString() + 'T' + (b.endTime || '00:00'));
                    if (s <= endDate) {
                      instances.push({ start: s, end: e });
                      count++;
                    }
                  }
                }
                cursor.setDate(cursor.getDate() + 7);
              } else {
                const s = new Date(cursor.toDateString() + 'T' + (b.startTime || '00:00'));
                const e = new Date(cursor.toDateString() + 'T' + (b.endTime || '00:00'));
                instances.push({ start: s, end: e });
                cursor.setDate(cursor.getDate() + 7);
                count++;
              }
            } else if (freq === 'monthly') {
              const s = new Date(cursor.toDateString() + 'T' + (b.startTime || '00:00'));
              const e = new Date(cursor.toDateString() + 'T' + (b.endTime || '00:00'));
              instances.push({ start: s, end: e });
              cursor.setMonth(cursor.getMonth() + 1);
              count++;
            } else {
              const s = new Date(cursor.toDateString() + 'T' + (b.startTime || '00:00'));
              const e = new Date(cursor.toDateString() + 'T' + (b.endTime || '00:00'));
              instances.push({ start: s, end: e });
              cursor.setDate(cursor.getDate() + 1);
              count++;
            }
          }
        } catch (err) {
          // ignore generator errors
        }
        return instances;
      };

      // 6) Check recurring bookings in existing bookings against this single instance
      for (const b of activeBookings) {
        if (!b.recurring) continue;
        const instances = generateRecurringInstances(b, formData.recurringEndDate || date);
        // DEBUG: show a sample of instances generated for this recurring booking
        console.debug('Recurring booking instances for', b.id || b.roomId || '(no-id)', instances.slice(0,5));
        for (const inst of instances) {
          if (!isValidDate(inst.start) || !isValidDate(inst.end)) {
            console.warn('Skipping malformed recurring instance for', b, inst);
            continue;
          }
          if (rangesOverlap(inst.start, inst.end, newStart, newEnd)) {
            console.debug('Conflict with recurring booking', { booking: b, instance: inst, newStart, newEnd });
            setConflicts([{ id: b.id || b.roomId || 'unknown', start: inst.start, end: inst.end, reason: 'Recurring booking' }]);
            setError('Selected time conflicts with existing recurring booking(s). See details below.');
            return;
          }
        }
      }

      // If recurring booking is being created, perform checks across generated instances
      if (formData.recurring && formData.recurringStartDate && (formData.recurringEndDate || formData.endType === 'occurrences')) {
        // Generate instance dates for the requested recurrence
        const freq = (formData.frequency || 'daily').toLowerCase();
        const startCursor = new Date(formData.recurringStartDate);
        const endCursor = formData.recurringEndDate ? new Date(formData.recurringEndDate) : null;
        const requestedInstances: { start: Date; end: Date }[] = [];
        let cursor = new Date(startCursor);
        let occurrences = 0;
        const maxOcc = formData.endType === 'occurrences' ? (formData.maxOccurrences || 0) : Infinity;
        const reqDaysOfWeek: string[] = Array.isArray(formData.daysOfWeek) ? formData.daysOfWeek : [];

        while ((endCursor ? cursor <= endCursor : occurrences < maxOcc) && occurrences < 1000) {
          if (freq === 'daily') {
            const s = new Date(cursor.toDateString() + 'T' + formData.startTime);
            const e = new Date(cursor.toDateString() + 'T' + formData.endTime);
            requestedInstances.push({ start: s, end: e });
            cursor.setDate(cursor.getDate() + (formData.recurInterval || 1));
            occurrences++;
          } else if (freq === 'weekly') {
            if (reqDaysOfWeek.length > 0) {
              const weekStart = new Date(cursor);
              for (let d = 0; d < 7 && occurrences < maxOcc && occurrences < 1000; d++) {
                const day = new Date(weekStart);
                day.setDate(weekStart.getDate() + d);
                const shortNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                const short = shortNames[day.getDay()];
                if (reqDaysOfWeek.includes(short)) {
                  const s = new Date(day.toDateString() + 'T' + formData.startTime);
                  const e = new Date(day.toDateString() + 'T' + formData.endTime);
                  if (!endCursor || s <= endCursor) {
                    requestedInstances.push({ start: s, end: e });
                    occurrences++;
                  }
                }
              }
              cursor.setDate(cursor.getDate() + 7 * (formData.recurInterval || 1));
            } else {
              const s = new Date(cursor.toDateString() + 'T' + formData.startTime);
              const e = new Date(cursor.toDateString() + 'T' + formData.endTime);
              requestedInstances.push({ start: s, end: e });
              cursor.setDate(cursor.getDate() + 7 * (formData.recurInterval || 1));
              occurrences++;
            }
          } else if (freq === 'monthly') {
            const s = new Date(cursor.toDateString() + 'T' + formData.startTime);
            const e = new Date(cursor.toDateString() + 'T' + formData.endTime);
            requestedInstances.push({ start: s, end: e });
            cursor.setMonth(cursor.getMonth() + (formData.recurInterval || 1));
            occurrences++;
          } else {
            const s = new Date(cursor.toDateString() + 'T' + formData.startTime);
            const e = new Date(cursor.toDateString() + 'T' + formData.endTime);
            requestedInstances.push({ start: s, end: e });
            cursor.setDate(cursor.getDate() + 1);
            occurrences++;
          }
          if (!endCursor && formData.endType === 'occurrences' && occurrences >= maxOcc) break;
        }

        // Check each requested instance against active bookings (including recurring instances)
        for (const inst of requestedInstances) {
          // capacity check for each instance
          if ((room.capacity || 0) > 0 && allParticipants.length > room.capacity) {
            setError(`Room capacity exceeded for one of the recurring instances (capacity: ${room.capacity}).`);
            return;
          }

          for (const b of activeBookings) {
            if (!b.recurring) {
              const exStart = new Date(b.date + 'T' + (b.startTime || '00:00'));
              const exEnd = new Date(b.date + 'T' + (b.endTime || '00:00'));
              if (rangesOverlap(exStart, exEnd, inst.start, inst.end)) {
                setError('Requested recurring instances conflict with existing bookings.');
                return;
              }
            } else {
              const instances = generateRecurringInstances(b, formData.recurringEndDate);
              for (const eb of instances) {
                if (rangesOverlap(eb.start, eb.end, inst.start, inst.end)) {
                  setError('Requested recurring instances conflict with existing recurring bookings.');
                  return;
                }
              }
            }
          }
        }
      }

      // No conflicts: submit booking
      const response = await fetch("http://localhost:3000/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingSubmissionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedBooking = await response.json();
      console.log("Booking saved successfully:", savedBooking);

      alert("Booking submitted successfully!");
      onClose(false);
    } catch (err) {
      console.error("Error saving booking:", err);
      setError(err instanceof Error ? err.message : String(err) || "Failed to save booking. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(true)}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Booking Details</h2>

        {error && (
          <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{error}</div>
            {conflicts && conflicts.length > 0 && (
              <div style={{ maxHeight: 140, overflowY: 'auto', padding: 8, background: '#fff5f5', borderRadius: 8, marginTop: 8, border: '1px solid #f2caca' }}>
                <div style={{ color: '#8b1c1c', fontWeight: 700, marginBottom: 6 }}>Conflicting booking(s):</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {conflicts.map((c, i) => (
                    <li key={i} style={{ marginBottom: 6, color: '#4a2e1f' }}>
                      <span style={{ fontWeight: 700, color: '#8b1c1c' }}>ID:</span> {String(c.id)} — <span style={{ fontWeight: 600 }}>{c.start.toDateString()}</span> <span style={{ color: '#6b4a3a' }}>{c.start.toTimeString().slice(0,5)} - {c.end.toTimeString().slice(0,5)}</span>
                      {c.reason && <div style={{ fontSize: 12, color: '#6b4a3a' }}>{c.reason}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

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

          {/* Floor Number */}
          <div className="form-group full-width">
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

          {/* Room Name */}
          <div className="form-group full-width">
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
                style={{ padding: '10px', borderRadius: '6px', border: '2px solid #ddb892' }}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                style={{ padding: '10px', borderRadius: '6px', border: '2px solid #ddb892' }}
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
              <div className="participant-input" style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search and select participants"
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