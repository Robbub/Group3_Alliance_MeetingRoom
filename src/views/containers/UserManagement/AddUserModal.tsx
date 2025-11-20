import React, { useState, ChangeEvent, useEffect } from 'react';
import './AddUserModal.css';

interface User {
  id: number | string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: string;
  avatar?: string;
  lastSeen?: string;
  name?: string;
}

interface AddUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string; 
  password: string;
  confirmPassword: string;
  role: string;
  avatar: File | null;
}

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: () => void;
  editingUser?: User | null; 
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser, editingUser }) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    firstName: editingUser?.firstName || '',
    lastName: editingUser?.lastName || '',
    email: editingUser?.email || '',
    username: editingUser?.username || '', 
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username || !formData.firstName || !formData.lastName) {
      alert("Please fill in all required fields");
      return;
    }

    if (!editingUser && (!formData.password || formData.password !== formData.confirmPassword)) {
      alert("Password and confirm password must match");
      return;
    }
    
    try {
      if (editingUser) {
        // UPDATE USER
        const response = await fetch(`http://localhost:64508/api/Account/UpdateUser/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserId: formData.username,
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Role: formData.role,
            Email: formData.email || "" // Send empty string if no email, NOT username
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Update error:", errorData);
          throw new Error("Failed to update user");
        }
      } else {
        // ADD NEW USER
        const response = await fetch("http://localhost:64508/api/Account/Register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            UserId: formData.username,
            Password: formData.password,
            FirstName: formData.firstName,
            LastName: formData.lastName,
            Role: formData.role,
            Email: formData.email || "" // Send empty string if no email, NOT username
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Register error:", errorData);
          throw new Error("Failed to add user");
        }
      }
      
      onAddUser();
      onClose();
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Operation failed: ${errorMessage}`);
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
          <input 
            type="text" 
            placeholder="First Name" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleInputChange} 
            required
          />
          <input 
            type="text" 
            placeholder="Last Name" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleInputChange} 
            required
          />
        </div>

        <input 
          type="text" 
          placeholder="Username" 
          name="username" 
          value={formData.username} 
          onChange={handleInputChange} 
          required
          className="username-input"
        />

        <input 
          type="email" 
          placeholder="Email" 
          name="email" 
          value={formData.email} 
          onChange={handleInputChange} 
        />

        <input 
          type="password" 
          placeholder={editingUser ? "New Password (optional)" : "Password"} 
          name="password" 
          value={formData.password} 
          onChange={handleInputChange} 
          required={!editingUser}
        />
        
        <input 
          type="password" 
          placeholder="Confirm Password" 
          name="confirmPassword" 
          value={formData.confirmPassword} 
          onChange={handleInputChange} 
          required={!editingUser}
        />

        <div className="role-section">
          {['Member', 'Admin', 'Super Admin'].map((role) => (
            <label key={role}>
              <input 
                type="radio" 
                name="role" 
                value={role} 
                checked={getDisplayRole(formData.role) === role} 
                onChange={() => handleRoleChange(role)} 
              />
              {role}
            </label>
          ))}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>
          {editingUser ? 'Update User' : 'Add User'}
        </button>
      </div>
    </div>
  );
};

export default AddUserModal;