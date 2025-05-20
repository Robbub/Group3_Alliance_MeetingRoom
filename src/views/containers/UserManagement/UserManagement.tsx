import React, { useState, useMemo, useEffect } from "react";
import { FaChevronUp, FaChevronDown, FaTrashAlt, FaWrench } from "react-icons/fa";
import { Header } from "../../../views/components/Header/Header";
import "./UserManagement.css";

type Role = "Admin" | "Super Admin" | "Member";

interface User {
  id: number;
  email: string;
  lastSeen: string;
  name: string;
  role: string;
}

interface LoggedUser {
  id?: number | string;
  username: string;
  password: string;
  role?: string;
}

const loginUsername = "superadmin"; // Change to "admin" to simulate Admin login

const loginUsers: LoggedUser[] = [
  {
    username: "admin",
    password: "admin",
    role: "admin",
  },
  {
    username: "superadmin",
    password: "superadmin",
    role: "super admin",
  },
];

const initialUsers: User[] = [
  { id: 1, email: "sophia.lane@example.com", lastSeen: "05-11-2025 | 3:45 PM", name: "Sophia Lane", role: "Admin" },
  { id: 2, email: "daniel.reed@example.com", lastSeen: "03-28-2025 | 1:10 AM", name: "Daniel Reed", role: "Member" },
  { id: 3, email: "olivia.chan@example.com", lastSeen: "04-17-2025 | 9:30 AM", name: "Olivia Chan", role: "Super Admin" },
  { id: 4, email: "liam.morris@example.com", lastSeen: "05-10-2025 | 6:20 PM", name: "Liam Morris", role: "Member" },
  { id: 5, email: "emma.jones@example.com", lastSeen: "04-21-2025 | 11:15 AM", name: "Emma Jones", role: "Admin" },
  { id: 6, email: "noah.davis@example.com", lastSeen: "05-07-2025 | 2:05 PM", name: "Noah Davis", role: "Member" },
  { id: 7, email: "ava.martinez@example.com", lastSeen: "05-14-2025 | 4:50 PM", name: "Ava Martinez", role: "Super Admin" },
  { id: 8, email: "ethan.green@example.com", lastSeen: "05-03-2025 | 8:30 PM", name: "Ethan Green", role: "Member" },
  { id: 9, email: "isabella.white@example.com", lastSeen: "04-30-2025 | 9:00 AM", name: "Isabella White", role: "Admin" },
  { id: 10, email: "logan.clark@example.com", lastSeen: "05-12-2025 | 7:40 AM", name: "Logan Clark", role: "Member" },
  { id: 11, email: "mia.carter@example.com", lastSeen: "05-09-2025 | 5:00 PM", name: "Mia Carter", role: "Super Admin" },
];

const USERS_PER_PAGE = 11;

type SortKey = keyof User;
type SortDirection = "asc" | "desc";

const fetchCurrentUserRole = (): Promise<Role | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem("user"); // or "loggedInUser" if you use that key
      if (!storedUser) return resolve(null);

      try {
        const user = JSON.parse(storedUser);
        const roleLower = user.role?.toLowerCase();
        if (roleLower === "admin") resolve("Admin");
        else if (roleLower === "super admin") resolve("Super Admin");
        else resolve("Member");
      } catch {
        resolve(null);
      }
    }, 500);
  });
};


const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("email");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserRole, setCurrentUserRole] = useState<Role>("Member");

 useEffect(() => {
  fetchCurrentUserRole().then((role) => {
    if (role) setCurrentUserRole(role);
  });
}, []);


  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aVal = String(a[sortKey]).toLowerCase();
        const bVal = String(b[sortKey]).toLowerCase();
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [users, search, sortKey, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    const pageUsers = [...filteredUsers.slice(start, start + USERS_PER_PAGE)];
    while (pageUsers.length < USERS_PER_PAGE) {
      pageUsers.push({ id: -1, email: "", lastSeen: "", name: "", role: "" });
    }
    return pageUsers;
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));

  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const updateUserRole = (id: number, newRole: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    );
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const dropdowns = document.querySelectorAll(".role-cell");
      let clickedInside = false;
      dropdowns.forEach((dropdown) => {
        if (dropdown.contains(e.target as Node)) clickedInside = true;
      });
      if (!clickedInside) setHoveredUserId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredUsers, totalPages]);

  return (
    <div className="user-management-page">
      <Header />
      <div className="user-management-content">
        <div className="user-management-header">
          <h1 className="manage-users-heading">Manage Users</h1>
          <div className="search-and-add">
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-user-btn" disabled={currentUserRole !== "Super Admin"}>
              Add New User
            </button>
          </div>
        </div>

        <div className="user-table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th></th>
                <th onClick={() => handleSort("email")}>Email {sortKey === "email" && (sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleSort("lastSeen")}>Last Seen {sortKey === "lastSeen" && (sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleSort("name")}>Name {sortKey === "name" && (sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th onClick={() => handleSort("role")}>Role {sortKey === "role" && (sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />)}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => {
                const isSuperAdminUser = user.role === "Super Admin";
                const canEditOrDelete = currentUserRole === "Super Admin" || (currentUserRole === "Admin" && !isSuperAdminUser);
                const canChangeRole = canEditOrDelete;
                const showCheckbox = user.id !== -1 && canEditOrDelete;
                const showAvatar = user.id !== -1;

                return (
                  <tr key={user.id} className={user.id === -1 ? "empty-row" : ""}>
                    <td>
                      {user.id !== -1 && (
                        <div className="checkbox-avatar">
                          {showCheckbox ? <input type="checkbox" /> : <span style={{ width: 18, display: "inline-block" }} />}
                          {showAvatar && <span className="avatar-placeholder" />}
                        </div>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{user.lastSeen}</td>
                    <td>{user.name}</td>
                    <td className="role-cell">
                      {user.id !== -1 && canChangeRole ? (
                        <div className="role-display" onClick={() => setHoveredUserId(hoveredUserId === user.id ? null : user.id)}>
                          {user.role}
                          <span className={`dropdown-icon ${hoveredUserId === user.id ? "open" : ""}`}>
                            <FaChevronDown />
                          </span>
                          {hoveredUserId === user.id && (
                            <div className="role-dropdown">
                              {["Member", "Admin", "Super Admin"].map((role) => (
                                <div key={role} className="role-option" onClick={() => { updateUserRole(user.id, role); setHoveredUserId(null); }}>
                                  {role}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="role-display no-dropdown">{user.role}</div>
                      )}
                    </td>
                    <td>
  {user.id !== -1 && canEditOrDelete && (
    <>
      <button className="action-btn"><FaWrench /></button>
      <button className="action-btn delete" onClick={() => handleDelete(user.id)}><FaTrashAlt /></button>
    </>
  )}
</td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
            &larr;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <span key={i} className={`page-number ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </span>
          ))}
          <button className="pagination-btn" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
