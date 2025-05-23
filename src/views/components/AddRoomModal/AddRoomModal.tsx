import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './AddRoomModal.css'; // Make sure to create this CSS file

interface AddRoomModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (room: Room) => void;
  existingRooms: Room[]; 
}

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
  available: boolean;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ show, onHide, onSave, existingRooms }) => {
  const [roomName, setRoomName] = useState('');
  const [floorNumber, setFloorNumber] = useState('1');
  const [capacity, setCapacity] = useState('1');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [tempAmenity, setTempAmenity] = useState('');
  const [coverPhoto, setCoverPhoto] = useState('');
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);


  const handleAddAmenity = () => {
    if (tempAmenity.trim() && amenities.length < 5) {
      setAmenities([...amenities, tempAmenity.trim()]);
      setTempAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

 const handleSave = () => {
    // Calculate next ID
    const maxId = existingRooms.reduce(
      (max, room) => Math.max(max, room.id), 
      0
    );
    const newId = maxId + 1;

    onSave({
      id: newId, // Auto-incremented ID
      roomName,
      floorNumber,
      capacity: parseInt(capacity),
      amenities,
      coverPhoto: coverPhotoFile?.name || '',
      available: true
    });
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
                <p className="modal-title">Add new room</p>
                <p className="modal-subtitle">Set up a new room for bookings.</p>
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
              id="room-input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Floor Number*</label>
              <select
                className="form-select"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
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
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
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
                {coverPhoto ? (
                    <img 
                        src={coverPhoto} 
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
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        setCoverPhoto(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                    }
                }}
                />
            </div>
            </div>

          <div className="form-group">
            <label className="form-label">Amenities*</label>
            <p className="form-hint">Add 1–5 keywords that describe this room's amenities.</p>
            <div className="amenities-container">
              {amenities.map((amenity, i) => (
                <div key={i} className="amenity-badge">
                  {amenity}
                  <span className="amenity-remove" onClick={() => handleRemoveAmenity(amenity)}>
                    <FaTimes />
                  </span>
                </div>
              ))}
            </div>
            {amenities.length < 5 && (
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
            disabled={!roomName || amenities.length === 0}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;