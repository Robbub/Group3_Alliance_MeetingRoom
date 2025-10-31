import React, { useState, ChangeEvent, useEffect } from 'react';
import './AddUserModal.css';
import { User, AddUserFormData } from '../../../types/User';

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: () => void; // Now parent fetches users after add/edit
  editingUser?: User | null; 
}

const API_URL = "https://localhost:50552/api/Users"; // Replace with your backend URL

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
      reader.onload = () => setAvatarPreview(reader.result as string);
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
    // Basic validation
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
      let avatarUrl = avatarPreview;

      const userData: Partial<User> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email,
        username: formData.email,
        role: formData.role,
        avatar: avatarUrl,
        ...(formData.password && { password: formData.password }),
      };

      if (editingUser) {
        // Edit user
        const response = await fetch(`${API_URL}/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editingUser, ...userData }),
        });
        if (!response.ok) throw new Error("Failed to update user");
        alert('User updated successfully!');
      } else {
        // Add new user
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Failed to add user");
        alert('User added successfully!');
      }

      onAddUser(); // Refresh parent user list
      onClose();
    } catch (error) {
      console.error(error);
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
            <img src={avatarPreview} alt="User Avatar" className="avatar-preview" />
          </div>
          <label className="upload-btn">
            📤 Upload
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="form-row">
          <input type="text" placeholder="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
          <input type="text" placeholder="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
        </div>

        <input type="email" placeholder="Email" name="email" value={formData.email} onChange={handleInputChange} />

        <input type="password" placeholder={editingUser ? "New Password (optional)" : "Password"} name="password" value={formData.password} onChange={handleInputChange} />
        <input type="password" placeholder="Confirm Password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} />

        <div className="role-section">
          {['Member', 'Admin', 'Super Admin'].map((role) => (
            <label key={role}>
              <input type="radio" name="role" value={role} checked={getDisplayRole(formData.role) === role} onChange={() => handleRoleChange(role)} />
              {role}
            </label>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>{editingUser ? 'Update User' : 'Add User'}</button>
      </div>
    </div>
  );
};

export default AddUserModal;
