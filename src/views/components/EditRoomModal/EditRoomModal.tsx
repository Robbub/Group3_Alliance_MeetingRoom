import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './EditRoomModal.css';

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
  available: boolean;
}

interface EditRoomModalProps {
  show: boolean;
  onHide: () => void;
  room: Room;
  onSave: (updatedRoom: Room) => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ show, onHide, room, onSave }) => {
  const [editedRoom, setEditedRoom] = useState<Room>({ ...room });
  const [tempAmenity, setTempAmenity] = useState('');
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedRoom(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) : value 
    }));
  };

  const handleAddAmenity = () => {
    if (tempAmenity.trim() && editedRoom.amenities.length < 5) {
      setEditedRoom(prev => ({
        ...prev,
        amenities: [...prev.amenities, tempAmenity.trim()]
      }));
      setTempAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setEditedRoom(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedRoom(prev => ({
          ...prev,
          coverPhoto: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const updatedRoom = {
      ...room,
      ...editedRoom, 
      id: room.id, 
      coverPhoto: coverPhotoFile 
        ? URL.createObjectURL(coverPhotoFile) 
        : editedRoom.coverPhoto, 
    };
    
    onSave(updatedRoom);
    onHide();
  };



  const floorOptions = Array.from({ length: 17 }, (_, i) => (i + 1).toString());
  const capacityOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="main-header">
          <div className="modal-header">
            <p className="modal-title">Edit room</p>
            <p className="modal-subtitle">Update room details and amenities.</p>
          </div>
          <div className="closeBtn">
            <button className="btn-close" onClick={onHide}>
              <span className="close-icon">&times;</span>
            </button>
          </div>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Room Name*</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Linear"
              name="roomName"
              value={editedRoom.roomName}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Floor Number*</label>
              <select
                className="form-select"
                name="floorNumber"
                value={editedRoom.floorNumber}
                onChange={handleSelectChange}
              >
                {floorOptions.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Capacity*</label>
              <select
                className="form-select"
                name="capacity"
                value={editedRoom.capacity.toString()}
                onChange={handleSelectChange}
              >
                {capacityOptions.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group" id="cover-upload">
            <label className="form-label">Cover image*</label>
            <div 
              className="file-upload-area" 
              onClick={() => document.getElementById('coverPhotoInput')?.click()}
              style={{ height: '50px' }} 
            >
              {editedRoom.coverPhoto ? (
                <img 
                  src={editedRoom.coverPhoto} 
                  alt="Room preview" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  className="img-preview"
                />
              ) : (
                <>
                  <div className="file-upload-text">Click to upload or drag and drop</div>
                  <div className="file-upload-hint">SVG, PNG, JPG or GIF (max. 800×400px)</div>
                </>
              )}
              <input
                type="file"
                id="coverPhotoInput"
                accept="image/*"
                className="hidden-file-input" 
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amenities*</label>
            <p className="form-hint">Add 1–5 keywords that describe this room's amenities.</p>
            <div className="amenities-container">
              {editedRoom.amenities.map((amenity, i) => (
                <div key={i} className="amenity-badge">
                  {amenity}
                  <span className="amenity-remove" onClick={() => handleRemoveAmenity(amenity)}>
                    <FaTimes />
                  </span>
                </div>
              ))}
            </div>
            {editedRoom.amenities.length < 5 && (
              <div className="amenity-input-container">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. whiteboard, video conferencing"
                  value={tempAmenity}
                  onChange={(e) => setTempAmenity(e.target.value)}
                />
                <button 
                  className="btn btn-outline"
                  onClick={handleAddAmenity}
                  disabled={!tempAmenity.trim()}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onHide}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!editedRoom.roomName || editedRoom.amenities.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;