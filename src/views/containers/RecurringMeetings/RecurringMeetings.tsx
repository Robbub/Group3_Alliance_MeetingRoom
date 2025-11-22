import React, { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { Header } from "../../components/Header/Header";
import { AddRecurringModal } from "../../components/AddRecurringModal/AddRecurringModal";
import { FaCalendarAlt, FaClock, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import "./RecurringMeetings.css";

interface RecurringMeeting {
  id: number;
  title: string;
  room: string;
  frequency: "Weekly" | "Bi-weekly" | "Monthly";
  day: string;
  time: string;
  duration: string;
  organizer: string;
  participants: number;
  nextOccurrence: string;
  status: "active" | "paused";
}

export const RecurringMeetings = () => {
  const [recurringMeetings, setRecurringMeetings] = useState<RecurringMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchRecurringMeetings();
  }, []);

  const fetchRecurringMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:64508/api/Booking/GetRecurringMeetings");
      
      if (!response.ok) {
        throw new Error('Failed to fetch recurring meetings');
      }
      
      const data = await response.json();
      
      console.log("Fetched recurring meetings:", data);
      
      // Transform backend data to match RecurringMeeting interface
      const formattedMeetings: RecurringMeeting[] = data.map((meeting: any) => ({
        id: meeting.id,
        title: meeting.title || "Recurring Meeting",
        room: meeting.room || "Unknown Room",
        frequency: meeting.frequency || "Weekly",
        day: meeting.day || "Monday",
        time: meeting.time || "10:00 AM",
        duration: meeting.duration || "1 hour",
        organizer: meeting.organizer || "Unknown",
        participants: meeting.participants || 0,
        nextOccurrence: meeting.nextOccurrence || "",
        status: meeting.status === "paused" ? "paused" : "active"
      }));
      
      setRecurringMeetings(formattedMeetings);
    } catch (error) {
      console.error("Error fetching recurring meetings:", error);
      // Set empty array on error
      setRecurringMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseResume = async (id: number) => {
    try {
      const meeting = recurringMeetings.find(m => m.id === id);
      if (!meeting) return;

      const endpoint = meeting.status === "active" 
        ? `http://localhost:64508/api/Booking/${id}/pause`
        : `http://localhost:64508/api/Booking/${id}/approve`;
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Update local state
        setRecurringMeetings(meetings =>
          meetings.map(m =>
            m.id === id
              ? { ...m, status: m.status === "active" ? "paused" : "active" }
              : m
          )
        );
      } else {
        console.error("Failed to update meeting status");
      }
    } catch (error) {
      console.error("Error updating meeting status:", error);
    }
  };

  const handleEdit = (id: number) => {
    console.log("Edit meeting:", id);
    // TODO: Open edit modal
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this recurring meeting? This will remove all future occurrences.")) {
      try {
        const response = await fetch(`http://localhost:64508/api/Booking/DeleteBooking/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setRecurringMeetings(meetings => meetings.filter(meeting => meeting.id !== id));
        } else {
          console.error("Failed to delete meeting");
          alert("Failed to delete meeting. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting meeting:", error);
        alert("Error deleting meeting. Please check your connection and try again.");
      }
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Weekly":
        return "#64442F";
      case "Bi-weekly":
        return "#8B5E3C";
      case "Monthly":
        return "#A67C52";
      default:
        return "#64442F";
    }
  };

  return (
    <>
      <Header />
      <div className="admin-layout">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="admin-content">
          <div className="recurring-meetings-main">
            <div className="recurring-meetings-header">
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
              </button>
              <div>
                <h1>Recurring Meetings</h1>
                <p className="page-subtitle">Manage scheduled recurring meetings</p>
              </div>
              <button className="add-recurring-btn" onClick={() => setShowAddModal(true)}>
                <FaCalendarAlt />
                Add Recurring Meeting
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <p>Loading recurring meetings...</p>
              </div>
            ) : recurringMeetings.length === 0 ? (
              <div className="empty-state">
                <FaCalendarAlt className="empty-icon" />
                <h3>No Recurring Meetings</h3>
                <p>Get started by creating your first recurring meeting</p>
              </div>
            ) : (
              <div className="recurring-meetings-grid">
                {recurringMeetings.map((meeting) => (
                  <div key={meeting.id} className="recurring-meeting-card">
                    <div className="card-header">
                      <h3>{meeting.title}</h3>
                      <span className={`status-badge ${meeting.status}`}>
                        {meeting.status}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="meeting-detail">
                        <strong>Conference Room A</strong>
                        <span className="room-name">{meeting.room}</span>
                      </div>

                      <div className="meeting-schedule">
                        <div className="schedule-row">
                          <span className="label">Frequency</span>
                          <span className="value">{meeting.frequency}</span>
                        </div>
                        <div className="schedule-row">
                          <span className="label">Day</span>
                          <span className="value">{meeting.day}</span>
                        </div>
                      </div>

                      <div className="meeting-schedule">
                        <div className="schedule-row">
                          <span className="label">Time</span>
                          <span className="value">
                            <FaClock /> {meeting.time}
                          </span>
                        </div>
                        <div className="schedule-row">
                          <span className="label">Duration</span>
                          <span className="value">{meeting.duration}</span>
                        </div>
                      </div>

                      <div className="meeting-info">
                        <div className="info-row">
                          <FaUser /> {meeting.participants}
                        </div>
                        <div className="info-row">
                          Next: {meeting.nextOccurrence}
                        </div>
                      </div>

                      <div className="organizer-info">
                        Organized by {meeting.organizer}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        className="action-btn pause-btn"
                        onClick={() => handlePauseResume(meeting.id)}
                      >
                        {meeting.status === "active" ? "Pause" : "Resume"}
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(meeting.id)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(meeting.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddRecurringModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchRecurringMeetings();
          }}
        />
      )}
    </>
  );
};
