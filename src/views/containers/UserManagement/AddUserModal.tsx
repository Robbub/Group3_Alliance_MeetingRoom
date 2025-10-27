import React, { useState, ChangeEvent } from 'react';
import './AddUserModal.css';
import { User, AddUserFormData } from '../../../types/User';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (data: User) => void;
  editingUser?: User | null; 
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser, editingUser }) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    firstName: editingUser?.firstName || '',
    lastName: editingUser?.lastName || '',
    email: editingUser?.email || '',
    password: '',
    confirmPassword: '',
    role: editingUser?.role || 'user',
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(
    editingUser?.avatar || "https://cdn-icons-png.flaticon.com/512/706/706830.png"
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, avatar: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDisplayRole = (role: string): string => {
    switch (role) {
      case "user": return "Member";
      case "admin": return "Admin"; 
      case "super admin": return "Super Admin";
      default: return "Member";
    }
  };

  const handleRoleChange = (role: string) => {
    const dbRole = role === "Member" ? "user" :
                  role === "Admin" ? "admin" : "super admin";
    setFormData({ ...formData, role: dbRole });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      alert('Please enter a password');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      let avatarUrl = editingUser?.avatar || "https://cdn-icons-png.flaticon.com/512/706/706830.png";
      if (formData.avatar) {
        avatarUrl = URL.createObjectURL(formData.avatar);
      }

      // Don't store the computed name - let the parent component handle it
      const userData: User = {
        id: editingUser?.id || Date.now(),
        username: formData.email,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        password: formData.password || editingUser?.password || '',
        role: formData.role,
        avatar: avatarUrl,
        lastSeen: editingUser?.lastSeen || new Date().toLocaleString()
      };

      if (editingUser) {
        // When editing, only send the fields that can be updated
        const updateData = {
          ...editingUser, // Keep all existing data
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          role: userData.role,
          avatar: userData.avatar,
          ...(formData.password && { password: formData.password })
        };

        const response = await fetch(`http://localhost:3000/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error('Failed to update user');
        }

        // Return the updated user data with computed name
        const updatedUser = {
          ...updateData,
          name: `${updateData.firstName} ${updateData.lastName}`.trim()
        };

        alert('User updated successfully!');
        onAddUser(updatedUser);
      } else {
        const response = await fetch("http://localhost:3000/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error('Failed to add user');
        }

        // Return the new user data with computed name
        const newUser = {
          ...userData,
          name: `${userData.firstName} ${userData.lastName}`.trim()
        };

        alert('User added successfully!');
        onAddUser(newUser);
      }

      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Failed to save user. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>
        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>

        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={avatarPreview}
              alt="User Avatar"
              className="avatar-preview"
            />
          </div>
          <label className="upload-btn">
            📤 Upload
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Username / Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            {editingUser ? 'New Password (leave blank to keep current)' : 'Enter Password'}
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={editingUser ? "Leave blank to keep current password" : "Enter Password"}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
          />
        </div>

        <div className="role-section">
          <label>Role:</label>
          <div className="role-options">
            {['Member', 'Admin', 'Super Admin'].map((role) => (
              <label key={role} className="role-option">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={getDisplayRole(formData.role) === role}
                  onChange={() => handleRoleChange(role)}
                />
                <span className="radio-label">{role}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          {editingUser ? 'Update User' : 'Add User'}
        </button>
      </div>
    </div>
  );
};

export default AddUserModal;