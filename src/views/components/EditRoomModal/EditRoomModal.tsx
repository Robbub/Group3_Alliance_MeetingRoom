import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import './EditRoomModal.css';

interface Amenity {
  id: number;
  name: string;
  description: string;
}

interface EditRoomModalProps {
  show: boolean;
  onHide: () => void;
  room: Room | null;
  onSave: (updatedRoom: Room) => void;
  allAmenities: Amenity[]; // Receive all amenities
}

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: Amenity[]; // Use Amenity object array
  capacity: number;
  coverPhoto: string;
  available: boolean;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ show, onHide, room, onSave, allAmenities }) => {
  const [editedRoom, setEditedRoom] = useState<Omit<Room, 'id'>>({
    roomName: '',
    floorNumber: '1',
    amenities: [],
    capacity: 1,
    coverPhoto: '', // <-- This is the problem. It should be initialized with the room's cover photo.
    available: true,
  });
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]); // Store selected amenity IDs
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Track dropdown state

  // Populate form when room prop changes
  useEffect(() => {
    if (room) {
      setEditedRoom({
        roomName: room.roomName,
        floorNumber: room.floorNumber,
        amenities: room.amenities, // This is an array of objects
        capacity: room.capacity,
        coverPhoto: room.coverPhoto, // <-- Initialize with the existing cover photo
        available: room.available,
      });
      // Set initial selected IDs based on the room's amenities
      setSelectedAmenityIds(room.amenities.map(a => typeof a === 'object' ? a.id : a));
    } else {
      setEditedRoom({
        roomName: '',
        floorNumber: '1',
        amenities: [],
        capacity: 1,
        coverPhoto: '', // <-- This is fine for a new room
        available: true,
      });
      setSelectedAmenityIds([]);
    }
  }, [room]);

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

  const handleAmenityToggle = (amenityId: number) => {
    setSelectedAmenityIds(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditedRoom(prev => ({ ...prev, coverPhoto: event.target.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editedRoom.roomName || selectedAmenityIds.length === 0) {
      alert('Please fill in required fields and select at least one amenity.');
      return;
    }

    // Convert selected IDs back to Amenity objects for the parent component
    const selectedAmenitiesObjects = allAmenities.filter(amenity => selectedAmenityIds.includes(amenity.id));

    const updatedRoom: Room = {
      id: room!.id, // Use the ID from the original room
      roomName: editedRoom.roomName,
      floorNumber: editedRoom.floorNumber,
      amenities: selectedAmenitiesObjects, // Pass the object array
      capacity: editedRoom.capacity,
      coverPhoto: editedRoom.coverPhoto,
      available: editedRoom.available,
    };

    onSave(updatedRoom);
    onHide();
    setIsDropdownOpen(false); // Close dropdown on save
  };

  const floorOptions = Array.from({ length: 17 }, (_, i) => (i + 1).toString());
  const capacityOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  if (!show || !room) return null; // Add check for room

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Edit room</h3>
            <p className="modal-subtitle">Update room details and amenities.</p>
          </div>
          {/* Close Button - Positioned top right */}
          <button className="btn-close" onClick={onHide}>
            <FaTimes />
          </button>
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
                {floorOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
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
                {capacityOptions.map(num => (
                  <option key={num} value={num}>{num}</option>
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
            <p className="form-hint">Select amenities for this room.</p>
            {/* Multi-Select Dropdown */}
            <div className="multi-select-container">
              <button
                className="multi-select-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedAmenityIds.length > 0 ? `${selectedAmenityIds.length} Selected` : 'Select Amenities'}
                <FaChevronDown className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="multi-select-dropdown">
                  <div className="multi-select-header">
                    Select Amenities
                  </div>
                  {allAmenities.map(amenity => (
                    <div
                      key={amenity.id}
                      className="multi-select-option"
                      onClick={() => handleAmenityToggle(amenity.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAmenityIds.includes(amenity.id)}
                        readOnly
                      />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onHide}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!editedRoom.roomName || selectedAmenityIds.length === 0}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;