import React, { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import { FaClock, FaCheckCircle, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import "./AdminDashboard.css";
import { 
  adminService, 
  DashboardStats, 
  TodaysMeeting, 
  RoomUtilization 
} from "../../../services/adminService";
import { Header } from "../../components/Header/Header";

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    approvedToday: 0,
    activeBookings: 0,
    completionRate: 0
  });
  const [todaysMeetings, setTodaysMeetings] = useState<TodaysMeeting[]>([]);
  const [roomUtilization, setRoomUtilization] = useState<RoomUtilization[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // refresh data every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsData, meetingsData, utilizationData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getTodaysMeetings(),
        adminService.getRoomUtilization()
      ]);

      setStats(statsData);
      setTodaysMeetings(meetingsData);
      setRoomUtilization(utilizationData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format stats for display with icons
  const statsDisplay = [
    {
      title: "Pending Requests",
      value: stats.pendingRequests.toString(),
      subtitle: "Awaiting approval",
      change: stats.pendingRequests > 0 ? `${stats.pendingRequests} pending` : "All clear",
      changeType: stats.pendingRequests > 5 ? "increase" : "",
      icon: <FaClock />,
    },
    {
      title: "Approved Today",
      value: stats.approvedToday.toString(),
      subtitle: "Bookings confirmed",
      change: `${stats.approvedToday} bookings today`,
      changeType: stats.approvedToday > 0 ? "increase" : "",
      icon: <FaCheckCircle />,
    },
    {
      title: "Active Bookings",
      value: stats.activeBookings.toString(),
      subtitle: "Currently in use",
      change: stats.activeBookings > 0 ? "Rooms occupied" : "No active meetings",
      changeType: "",
      icon: <FaCalendarAlt />,
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      subtitle: "Last 30 days",
      change: stats.completionRate >= 90 ? "↑ Excellent!" : "Room for improvement",
      changeType: stats.completionRate >= 90 ? "increase" : "decrease",
      icon: <FaChartLine />,
    },
  ];

  return (
    <>
      <Header />
      <div className="admin-layout">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="admin-content">
          <div className="dashboard-main">
            <div className="dashboard-header">
            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <GoSidebarExpand /> : <GoSidebarCollapse />}
            </button>
            <div>
              <h1>Dashboard</h1>
              
            </div>
              
          </div>
          {/* <p className="dashboard-subtitle">Overview of your meeting room bookings</p> */}

          {/* Stats Cards */}
          <div className="stats-grid">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-content">
                  <h3 className="stat-title">{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <p className="stat-subtitle">{stat.subtitle}</p>
                  {stat.change && (
                    <p className={`stat-change ${stat.changeType}`}>{stat.change}</p>
                  )}
                </div>
                <div className="stat-icon">{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Content Sections */}
          <div className="dashboard-content-grid">
            {/* Today's Meetings */}
            <div className="dashboard-section">
              <h2 className="section-title">Today's Meetings</h2>
              <p className="section-subtitle">Upcoming scheduled meetings</p>
              {loading ? (
                <p>Loading meetings...</p>
              ) : todaysMeetings.length === 0 ? (
                <p>No meetings scheduled for today</p>
              ) : (
                <div className="meetings-list">
                  {todaysMeetings.map((meeting) => (
                    <div key={meeting.id} className="meeting-item">
                      <div className="meeting-details">
                        <h4>{meeting.roomName}</h4>
                        <p className="meeting-user">{meeting.organizer}</p>
                      </div>
                      <div className="meeting-time-status">
                        <span className="meeting-time">{meeting.startTime} - {meeting.endTime}</span>
                        <span className={`meeting-status ${meeting.status}`}>
                          {meeting.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Utilization */}
            <div className="dashboard-section">
              <h2 className="section-title">Room Utilization</h2>
              <p className="section-subtitle">Last 30 days occupancy rates</p>
              {loading ? (
                <p>Loading utilization data...</p>
              ) : roomUtilization.length === 0 ? (
                <p>No utilization data available</p>
              ) : (
                <div className="utilization-list">
                  {roomUtilization.map((room, index) => (
                    <div key={index} className="utilization-item">
                      <div className="utilization-header">
                        <span className="room-name">{room.roomName}</span>
                        <span className="room-percentage">{room.percentage}%</span>
                      </div>
                      <div className="utilization-bar">
                        <div
                          className="utilization-fill"
                          style={{ width: `${room.percentage}%`, backgroundColor: room.color }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
