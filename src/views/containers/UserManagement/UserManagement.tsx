import React, { useState, useEffect, useMemo } from "react";
import { FaChevronUp, FaChevronDown, FaTrashAlt, FaEdit } from "react-icons/fa";
import { Header } from "../../../views/components/Header/Header";
import "./UserManagement.css";
import AddUserModal from "./AddUserModal";
import { User } from "../../../types/User";

type Role = "admin" | "super admin" | "user";

const USERS_PER_PAGE = 7;

type SortKey = "email" | "lastSeen" | "name" | "role";
type SortDirection = "asc" | "desc";

// Helper function to compute name from firstName and lastName
const computeName = (user: User): string => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }
  return user.name || user.username || "Unknown User";
};

const fetchCurrentUserRole = (): Promise<Role | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem("username");
      if (!storedUser) return resolve(null);
      
      // Get the actual user's role from db.json
      fetch("http://localhost:3000/users")
        .then(response => response.json())
        .then(users => {
          const currentUser = users.find((user: any) => user.username === storedUser);
          resolve(currentUser?.role || "user");
        })
        .catch(() => resolve("user"));
    }, 100);
  });
};

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("email");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUserRole, setCurrentUserRole] = useState<Role>("user");
  const [showModal, setShowModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch users from db.json
    fetch("http://localhost:3000/users")
      .then((response) => response.json())
      .then((dbUsers) => {
        const transformedUsers = dbUsers.map((user: any) => ({
          ...user,
          id: Number(user.id) || user.id,
          // Compute name on the fly, don't store it
          name: computeName(user),
          email: user.email || `${user.username}@company.com`,
          lastSeen: user.lastSeen || "Never logged in",
          avatar: user.avatar || "https://cdn-icons-png.flaticon.com/512/706/706830.png"
        }));
        setUsers(transformedUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      });

    // Get current user role
    fetchCurrentUserRole().then((role) => {
      if (role) setCurrentUserRole(role);
    });
  }, []);

  const handleAddUser = (userData: User) => {
    // Add the computed name to the user data
    const userWithComputedName = {
      ...userData,
      name: computeName(userData)
    };

    if (editingUser) {
      // Update existing user in the list
      setUsers((prev) => 
        prev.map(user => 
          user.id === userData.id ? userWithComputedName : user
        )
      );
    } else {
      // Add new user to the list
      setUsers((prev) => [userWithComputedName, ...prev]);
    }
    
    // Refresh the data from server after a short delay to ensure consistency
    setTimeout(() => {
      fetch("http://localhost:3000/users")
        .then((response) => response.json())
        .then((dbUsers) => {
          const transformedUsers = dbUsers.map((user: any) => ({
            ...user,
            id: Number(user.id) || user.id,
            name: computeName(user),
            email: user.email || `${user.username}@company.com`,
            lastSeen: user.lastSeen || "Never logged in",
            avatar: user.avatar || "https://cdn-icons-png.flaticon.com/512/706/706830.png"
          }));
          setUsers(transformedUsers);
        })
        .catch((error) => {
          console.error("Error refreshing users:", error);
        });
    }, 200);
    
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

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const email = user.email || "";
        const name = computeName(user);
        const username = user.username || "";
        const searchLower = (search || "").toLowerCase();
        
        return email.toLowerCase().includes(searchLower) ||
               name.toLowerCase().includes(searchLower) ||
               username.toLowerCase().includes(searchLower);
      })
      .sort((a, b) => {
        let aVal = "";
        let bVal = "";
        
        switch (sortKey) {
          case "name":
            aVal = computeName(a);
            bVal = computeName(b);
            break;
          case "email":
            aVal = a.email || "";
            bVal = b.email || "";
            break;
          case "lastSeen":
            aVal = a.lastSeen || "";
            bVal = b.lastSeen || "";
            break;
          case "role":
            aVal = a.role || "";
            bVal = b.role || "";
            break;
          default:
            aVal = String(a[sortKey] || "");
            bVal = String(b[sortKey] || "");
        }
        
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
  }, [users, search, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  // Edit user function
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowModal(true);
  };

  // Delete user function
  const handleDelete = async (id: number | string) => {
    const userToDelete = users.find(user => user.id === id);
    
    // Prevent deleting super admin
    if (userToDelete?.role === "super admin") {
      alert("Cannot delete Super Admin users!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await fetch(`http://localhost:3000/users/${id}`, {
          method: "DELETE",
        });
        setUsers(users.filter(user => user.id !== id));
        alert("User deleted successfully!");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user. Please try again.");
      }
    }
  };

  const getDisplayRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case "user": return "Member";
      case "admin": return "Admin";
      case "super admin": return "Super Admin";
      default: return "Member";
    }
  };

  const updateUserRole = async (id: number | string, newRole: string) => {
    const userToUpdate = users.find(user => user.id === id);
    
    // Prevent changing super admin role
    if (userToUpdate?.role === "super admin" && currentUserRole !== "super admin") {
      alert("Cannot modify Super Admin roles!");
      return;
    }

    try {
      const dbRole = newRole === "Member" ? "user" :
                    newRole === "Admin" ? "admin" : "super admin";
      
      // Preserve all user data when updating role
      const updateData = {
        ...userToUpdate,
        role: dbRole
      };
      
      await fetch(`http://localhost:3000/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      
      setUsers(users.map(user => 
        user.id === id ? { ...user, role: dbRole } : user
      ));
      alert("Role updated successfully!");
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update role. Please try again.");
    }
  };

  // Permission check functions remain the same
  const canEditUser = (user: User) => {
    if (currentUserRole === "super admin") return true;
    if (currentUserRole === "admin" && user.role !== "super admin") return true;
    return false;
  };

  const canDeleteUser = (user: User) => {
    if (user.role === "super admin") return false;
    if (currentUserRole === "super admin") return true;
    if (currentUserRole === "admin" && user.role === "user") return true;
    return false;
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
              className="search-input"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="add-user-btn"
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
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds(paginatedUsers.map(user => Number(user.id)));
                      } else {
                        setSelectedUserIds([]);
                      }
                    }}
                    checked={selectedUserIds.length === paginatedUsers.length && paginatedUsers.length > 0}
                  />
                </th>
                <th className="sortable" onClick={() => handleSort("email")}>
                  Username / Email
                  {sortKey === "email" && (
                    sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />
                  )}
                </th>
                <th className="sortable" onClick={() => handleSort("lastSeen")}>
                  Last Seen
                  {sortKey === "lastSeen" && (
                    sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />
                  )}
                </th>
                <th className="sortable" onClick={() => handleSort("name")}>
                  Name
                  {sortKey === "name" && (
                    sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />
                  )}
                </th>
                <th className="sortable" onClick={() => handleSort("role")}>
                  Role
                  {sortKey === "role" && (
                    sortDirection === "asc" ? <FaChevronUp /> : <FaChevronDown />
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="checkbox-avatar">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(Number(user.id))}
                        onChange={(e) => {
                          setSelectedUserIds((prev) =>
                            e.target.checked
                              ? [...prev, Number(user.id)]
                              : prev.filter((uid) => uid !== Number(user.id))
                          );
                        }}
                        disabled={user.role === "super admin" && currentUserRole !== "super admin"}
                      />
                      <img
                        src={user.avatar || "https://cdn-icons-png.flaticon.com/512/706/706830.png"}
                        alt={computeName(user)}
                        className="user-avatar"
                        onError={(e) => {
                          e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/706/706830.png";
                        }}
                      />
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.lastSeen}</td>
                  <td>{computeName(user)}</td>
                  <td>
                    {canEditUser(user) ? (
                      <select
                        value={getDisplayRole(user.role)}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                        {currentUserRole === "super admin" && (
                          <option value="Super Admin">Super Admin</option>
                        )}
                      </select>
                    ) : (
                      <span className="role-display">{getDisplayRole(user.role)}</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {canEditUser(user) && (
                        <button 
                          className="action-btn edit" 
                          onClick={() => handleEditUser(user)}
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                      )}
                      {canDeleteUser(user) && (
                        <button 
                          className="action-btn delete" 
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <FaTrashAlt />
                        </button>
                      )}
                      {!canEditUser(user) && !canDeleteUser(user) && (
                        <span className="no-actions">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddUserModal 
          onClose={() => {
            setShowModal(false);
            setEditingUser(null);
          }} 
          onAddUser={handleAddUser}
          editingUser={editingUser}
        />
      )}
    </div>
  );
};

export default UserManagementPage;