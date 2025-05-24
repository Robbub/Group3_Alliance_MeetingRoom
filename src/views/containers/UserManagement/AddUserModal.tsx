import React, { useState, ChangeEvent } from 'react';
import './AddUserModal.css';

interface AddUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  avatar: File | null;
}

interface AddUserModalProps {
  onClose: () => void;
  onAddUser: (data: AddUserFormData) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAddUser }) => {
  const [formData, setFormData] = useState<AddUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    avatar: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, role: checked ? value : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, avatar: file });
  };

  const handleSubmit = () => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    onAddUser(formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="add-user-modal">
        <button className="close-button" onClick={onClose}>×</button>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Add New User</h2>

        <div className="avatar-section">
          <div className="avatar">
            <img
              src="https://cdn-icons-png.flaticon.com/512/706/706830.png"
              alt="avatar"
              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
            />
          </div>
          <label className="upload-btn">
            Upload
            <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

       <div className="form-group">
  <label htmlFor="firstName">First Name</label>
  <input
    id="firstName"
    type="text"
    name="firstName"
    value={formData.firstName}
    onChange={handleInputChange}
  />

  <label htmlFor="lastName">Last Name</label>
  <input
    id="lastName"
    type="text"
    name="lastName"
    value={formData.lastName}
    onChange={handleInputChange}
  />

  <label htmlFor="email">Username / Email</label>
  <input
    id="email"
    type="email"
    name="email"
    value={formData.email}
    onChange={handleInputChange}
  />

  <label htmlFor="password">Enter Password</label>
  <input
    id="password"
    type="password"
    name="password"
    value={formData.password}
    onChange={handleInputChange}
  />

  <label htmlFor="confirmPassword">Confirm Password</label>
  <input
    id="confirmPassword"
    type="password"
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleInputChange}
  />
</div>

<div className="role-section">
  <span>Role:</span>
  {[' Member', ' Admin', ' Super Admin'].map((role) => (
    <label key={role}>
      <input
        type="checkbox"
        name="role"
        value={role}
        checked={formData.role === role}
        onChange={handleInputChange}
      />
      {role}
    </label>
  ))}
</div>


        <button className="submit-btn" onClick={handleSubmit}>Add User</button>
      </div>
    </div>
  );
};

export default AddUserModal;
