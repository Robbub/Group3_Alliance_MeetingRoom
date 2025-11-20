import React, { useState, useEffect } from 'react';
import { FaTimes, FaChevronDown } from 'react-icons/fa';
import './AddRoomModal.css';

interface Amenity {
  id: number;
  name: string;
  description: string;
}

interface AddRoomModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
  existingRooms: Room[];
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

const AddRoomModal: React.FC<AddRoomModalProps> = ({ show, onHide, onSave, existingRooms, allAmenities }) => {
  const [roomName, setRoomName] = useState('');
  const [floorNumber, setFloorNumber] = useState('1');
  const [capacity, setCapacity] = useState('1');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<number[]>([]); // Store selected amenity IDs
  const [coverPhoto, setCoverPhoto] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update selected amenities when allAmenities changes
  useEffect(() => {
    // Reset selections if needed
  }, [allAmenities]);

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
          setCoverPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    if (selectedAmenityIds.length === 0) {
      alert('Please select at least one amenity');
      return;
    }

<<<<<<< HEAD
    // Check for duplicate room names
    const isDuplicate = existingRooms.some(room =>
      room.roomName.toLowerCase() === roomName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert('A room with this name already exists. Please choose a different name.');
      return;
    }

    // Convert selected IDs back to Amenity objects for the parent component
    const selectedAmenitiesObjects = allAmenities.filter(amenity => selectedAmenityIds.includes(amenity.id));
=======
  const handleSave = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }

    if (amenities.length === 0) {
      alert('Please add at least one amenity');
      return;
    }

    // Check for duplicate room names
    const isDuplicate = existingRooms.some(room => 
      room.roomName.toLowerCase() === roomName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert('A room with this name already exists. Please choose a different name.');
      return;
    }
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f

    const newRoom: Omit<Room, 'id'> = {
      roomName: roomName.trim(),
      floorNumber,
      capacity: parseInt(capacity),
<<<<<<< HEAD
      amenities: selectedAmenitiesObjects, // Pass the object array
=======
      amenities,
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f
      coverPhoto: coverPhoto || getDefaultImage(),
      available: true
    };

<<<<<<< HEAD
    onSave(newRoom);
=======
    // Only pass data to parent, don't make API call here
    onSave(newRoom as Room); // Parent will handle the API call and add the ID
    
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f
    // Reset form
    setRoomName('');
    setFloorNumber('1');
    setCapacity('1');
<<<<<<< HEAD
    setSelectedAmenityIds([]);
    setCoverPhoto('');
=======
    setAmenities([]);
    setTempAmenity('');
    setCoverPhoto('');
    setCoverPhotoFile(null);
    
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f
    onHide();
    // Remove the alert from here - parent will handle it
  };

  const getDefaultImage = () => {
    const defaultImages = [
      "/assets/meeting-room2.jpg",
      "/assets/meeting-room7.png",
      "/assets/meeting-room4.png",
      "/assets/meeting-room5.jpg",
<<<<<<< HEAD
      "/assets/meeting-room6.png",
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };
=======
      "/assets/meeting-room6.png"
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };

  const floorOptions = Array.from({ length: 17 }, (_, i) => (i + 1).toString());
  const capacityOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());
>>>>>>> 98aecedf226ae26a53d0b4714f91f5c68499318f

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add room</h3>
            <p className="modal-subtitle">Enter details to create a new room.</p>
          </div>
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
                {Array.from({ length: 17 }, (_, i) => (i + 1).toString()).map(num => (
                  <option key={num} value={num}>{num}</option>
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
                {Array.from({ length: 50 }, (_, i) => (i + 1).toString()).map(num => (
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
            disabled={!roomName || selectedAmenityIds.length === 0}
          >
            Add Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;