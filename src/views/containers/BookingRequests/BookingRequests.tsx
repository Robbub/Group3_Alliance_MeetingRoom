import React, { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { Header } from "../../components/Header/Header";
import { FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import "./BookingRequests.css";

interface BookingRequest {
  id: number;
  requester: string;
  room: string;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  status: "pending" | "approved" | "rejected";
}

export const BookingRequests = () => {
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BookingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [searchTerm, statusFilter, bookingRequests]);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:64508/api/Bookings");
      const data = await response.json();
      
      // Transform backend data to match our interface
      const formattedRequests: BookingRequest[] = data.map((booking: any) => ({
        id: booking.bookingId,
        requester: `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() || "Unknown User",
        room: booking.room?.roomName || "Unknown Room",
        date: new Date(booking.bookingDate).toISOString().split('T')[0],
        time: booking.startTime,
        duration: calculateDuration(booking.startTime, booking.endTime),
        purpose: booking.purpose || "N/A",
        status: mapStatus(booking.bookingStatus)
      }));
      
      setBookingRequests(formattedRequests);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (startTime: string, endTime: string): string => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours === 1) return "1 hour";
    if (diffHours < 1) return `${Math.round(diffHours * 60)} minutes`;
    if (diffHours % 1 === 0) return `${diffHours} hours`;
    return `${diffHours.toFixed(1)} hours`;
  };

  const mapStatus = (backendStatus: string): "pending" | "approved" | "rejected" => {
    const statusLower = backendStatus?.toLowerCase() || "";
    if (statusLower.includes("approved") || statusLower.includes("confirmed")) return "approved";
    if (statusLower.includes("rejected") || statusLower.includes("cancelled")) return "rejected";
    return "pending";
  };

  const filterRequests = () => {
    let filtered = bookingRequests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.room.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:64508/api/Bookings/${id}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setBookingRequests((prev) =>
          prev.map((request) =>
            request.id === id ? { ...request, status: "approved" } : request
          )
        );
      }
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:64508/api/Bookings/${id}/reject`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setBookingRequests((prev) =>
          prev.map((request) =>
            request.id === id ? { ...request, status: "rejected" } : request
          )
        );
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  return (
    <>
      <Header />
      <div className="admin-layout">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="admin-content">
          <div className="booking-requests-main">
            <div className="booking-requests-header">
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <GoSidebarExpand /> : <GoSidebarCollapse />}
              </button>
              <div>
                <h1>Booking Requests</h1>
                <p className="page-subtitle">Review and manage meeting room booking requests</p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="booking-requests-controls">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by requester or room..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Booking Requests Table */}
            <div className="booking-requests-table-container">
              {loading ? (
                <p>Loading booking requests...</p>
              ) : filteredRequests.length === 0 ? (
                <p>No booking requests found</p>
              ) : (
                <table className="booking-requests-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Room</th>
                      <th>Date & Time</th>
                      <th>Duration</th>
                      <th>Purpose</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.requester}</td>
                        <td>{request.room}</td>
                        <td>
                          <div className="date-time">
                            <div>{request.date}</div>
                            <div className="time">{request.time}</div>
                          </div>
                        </td>
                        <td>{request.duration}</td>
                        <td>{request.purpose}</td>
                        <td>
                          <span className={`status-badge ${request.status}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {request.status === "pending" && (
                              <>
                                <button
                                  className="action-btn approve-btn"
                                  onClick={() => handleApprove(request.id)}
                                  title="Approve"
                                >
                                  <FaCheck />
                                </button>
                                <button
                                  className="action-btn reject-btn"
                                  onClick={() => handleReject(request.id)}
                                  title="Reject"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
