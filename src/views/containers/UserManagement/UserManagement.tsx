import React, { useState, useEffect, useMemo } from "react";
import { FaChevronUp, FaChevronDown, FaTrashAlt, FaEdit } from "react-icons/fa";
import { Header } from "../../../views/components/Header/Header";
import "./UserManagement.css";
import AddUserModal from "./AddUserModal";
import MassActionModal from "./MassActionModal";
import { User } from "../../../types/User";

type Role = "admin" | "super admin" | "user";
type SortKey = "email" | "name" | "role" | "username";
type SortDirection = "asc" | "desc";
const USERS_PER_PAGE = 7;
const API_URL = "https://localhost:3150/api/Account";

// Compute user display name
const computeName = (user: User) =>
  user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`.trim()
    : user.username || "Unknown User";

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("username");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserRole, setCurrentUserRole] = useState<Role>("user");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showMassActionModal, setShowMassActionModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/GetAllUsers`);
      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await res.json();
      
      // Add debugging to see what we're getting from backend
      console.log("Raw data from backend:", data);
      
      const mappedUsers = data.map((user: any) => {
        console.log(`User ${user.username} - Email: "${user.email}"`); // Debug each user's email
        return {
          id: String(user.id),
          username: user.username,
          email: user.email || "", // This should be the actual email from database
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          name: computeName(user),
        };
      });
      
      console.log("Mapped users:", mappedUsers); // Debug final mapped data
      setUsers(mappedUsers);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to load users: ${errorMessage}`);
      setUsers([]);
    }
  };

  // Get current user role from localStorage
  const fetchCurrentUserRole = async () => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) return;
    try {
      const res = await fetch(`${API_URL}/GetAllUsers`);
      const data = await res.json();
      const currentUser = data.find((u: any) => u.username === storedUser);
      setCurrentUserRole(currentUser?.role || "user");
    } catch {
      setCurrentUserRole("user");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  const handleAddUser = () => {
    fetchUsers();
    setEditingUser(null);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Filter + sort users
  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const searchLower = search.toLowerCase();
        return (
          (user.email || "").toLowerCase().includes(searchLower) ||
          computeName(user).toLowerCase().includes(searchLower) ||
          (user.username || "").toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        let aVal = "",
          bVal = "";
        switch (sortKey) {
          case "name":
            aVal = computeName(a);
            bVal = computeName(b);
            break;
          case "email":
            aVal = a.email || "";
            bVal = b.email || "";
            break;
          case "username":
            aVal = a.username || "";
            bVal = b.username || "";
            break;
          case "role":
            aVal = a.role || "";
            bVal = b.role || "";
            break;
          default:
            aVal = String(a[sortKey] || "");
            bVal = String(b[sortKey] || "");
        }
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
  }, [users, search, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(
    startIndex,
    startIndex + USERS_PER_PAGE
  );

  const canEditUser = (user: User) =>
    currentUserRole === "super admin" ||
    (currentUserRole === "admin" && user.role !== "super admin");
  const canDeleteUser = (user: User) =>
    user.role !== "super admin" &&
    (currentUserRole === "super admin" ||
      (currentUserRole === "admin" && user.role === "user"));

  const handleDeleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id);
    if (!user || user.role === "super admin")
      return alert("Cannot delete Super Admins!");
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`${API_URL}/DeleteUser/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      fetchUsers();
      setSelectedUserIds((prev) => prev.filter((uid) => uid !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    if (user.role === "super admin" && currentUserRole !== "super admin")
      return alert("Cannot modify Super Admin roles!");
    try {
      const response = await fetch(`${API_URL}/UpdateUser/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserId: user.username,
          FirstName: user.firstName,
          LastName: user.lastName,
          Role: newRole,
          Email: user.email
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };

  const handleMassRoleChange = async (role: string, ids: string[]) => {
    for (const id of ids) {
      await handleUpdateRole(id, role);
    }
    setSelectedUserIds([]);
    setShowMassActionModal(false);
  };

  const handleMassDelete = async (ids: string[]) => {
    if (!window.confirm(`Delete ${ids.length} user(s)?`)) return;
    for (const id of ids) {
      await handleDeleteUser(id);
    }
    setSelectedUserIds([]);
    setShowMassActionModal(false);
  };

  const getDisplayRole = (role: string) => {
    switch (role.toLowerCase()) {
      case "user":
        return "Member";
      case "admin":
        return "Admin";
      case "super admin":
        return "Super Admin";
      default:
        return "Member";
    }
  };

  return (
    <div className="user-management-page">
      <Header />
      <div className="user-management-content">
        <div className="user-management-header">
          <h1 className="manage-users-heading">Manage Users</h1>
          <div className="search-and-add">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              onClick={() => {
                setEditingUser(null);
                setShowModal(true);
              }}
            >
              Add New User
            </button>
          </div>
        </div>

        <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedUserIds.length === paginatedUsers.length &&
                    paginatedUsers.length > 0
                  }
                  onChange={(e) =>
                    setSelectedUserIds(
                      e.target.checked
                        ? paginatedUsers.map((u) => u.id)
                        : []
                    )
                  }
                />
              </th>
              <th onClick={() => handleSort("username")}>
                Username{" "}
                {sortKey === "username" ? (
                  sortDirection === "asc" ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )
                ) : (
                  ""
                )}
              </th>
              <th onClick={() => handleSort("email")}>
                Email{" "}
                {sortKey === "email" ? (
                  sortDirection === "asc" ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )
                ) : (
                  ""
                )}
              </th>
              <th onClick={() => handleSort("name")}>
                Name{" "}
                {sortKey === "name" ? (
                  sortDirection === "asc" ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )
                ) : (
                  ""
                )}
              </th>
              <th onClick={() => handleSort("role")}>
                Role{" "}
                {sortKey === "role" ? (
                  sortDirection === "asc" ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )
                ) : (
                  ""
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) =>
                      setSelectedUserIds((prev) =>
                        e.target.checked
                          ? [...prev, user.id]
                          : prev.filter((uid) => uid !== user.id)
                      )
                    }
                    disabled={
                      user.role === "super admin" &&
                      currentUserRole !== "super admin"
                    }
                  />
                </td>
                <td>{user.username}</td>
                <td>
                  {console.log(`Rendering email for ${user.username}: "${user.email}"`)}
                  {user.email || "-"}
                </td>
                <td>{computeName(user)}</td>
                <td>
                  {canEditUser(user) ? (
                    <select
                      value={getDisplayRole(user.role)}
                      onChange={(e) =>
                        handleUpdateRole(user.id, e.target.value)
                      }
                    >
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                      {currentUserRole === "super admin" && (
                        <option value="Super Admin">Super Admin</option>
                      )}
                    </select>
                  ) : (
                    <span>{getDisplayRole(user.role)}</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {canEditUser(user) && (
                      <button
                        className="action-btn edit"
                        onClick={() => {
                          setEditingUser(user);
                          setShowModal(true);
                        }}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDeleteUser(user) && (
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Delete User"
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {selectedUserIds.length > 0 && showMassActionModal && (
          <MassActionModal
            selectedUserIds={selectedUserIds}
            onChangeRole={handleMassRoleChange}
            onDeleteSelected={handleMassDelete}
            onCancel={() => setShowMassActionModal(false)}
          />
        )}

        {selectedUserIds.length > 0 && !showMassActionModal && (
          <button
            className="show-mass-action"
            onClick={() => setShowMassActionModal(true)}
          >
            Perform Actions on {selectedUserIds.length} user(s)
          </button>
        )}

        {showModal && (
          <AddUserModal
            onClose={() => setShowModal(false)}
            onAddUser={handleAddUser}
            editingUser={editingUser}
          />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;