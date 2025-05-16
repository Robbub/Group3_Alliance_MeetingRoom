import React, { useState } from 'react';
import './Admin.css';


// Define our Room type
type Room = {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
};

// using dummy data for now - this would come from our db.json ideally
const initialRooms: Room[] = [
  {
    id: 1,
    roomName: 'Room 1',
    floorNumber: '17th Floor',
    amenities: ['Projector', 'Whiteboard', 'Video Conferencing'],
    capacity: 10,
    coverPhoto: '',
  }
];

export const Admin: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Omit<Room, 'id'>>({ 
    roomName: '',
    floorNumber: '',
    amenities: [],
    capacity: 0,
    coverPhoto: '',
  });
  const [tempAmenity, setTempAmenity] = useState('');

  // for handling opening modals
  const openAddModal = () => {
    setNewRoom({ 
      roomName: '',
      floorNumber: '',
      amenities: [],
      capacity: 0,
      coverPhoto: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (room: Room) => {
    setCurrentRoom(room);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (room: Room) => {
    setCurrentRoom(room);
    setIsDeleteModalOpen(true);
  };

  // for handling form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isAddModalOpen) {
      setNewRoom(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) : value }));
    } else if (isEditModalOpen && currentRoom) {
      setCurrentRoom(prev => ({ ...prev!, [name]: name === 'capacity' ? parseInt(value) : value }));
    }
  };

  // for handling amenity addition
  const handleAddAmenity = () => {
    if (tempAmenity.trim()) {
      if (isAddModalOpen) {
        setNewRoom(prev => ({ ...prev, amenities: [...prev.amenities, tempAmenity.trim()] }));
      } else if (isEditModalOpen && currentRoom) {
        setCurrentRoom(prev => ({ ...prev!, amenities: [...prev!.amenities, tempAmenity.trim()] }));
      }
      setTempAmenity('');
    }
  };

  // for handling amenity removal
  const handleRemoveAmenity = (amenity: string) => {
    if (isAddModalOpen) {
      setNewRoom(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
    } else if (isEditModalOpen && currentRoom) {
      setCurrentRoom(prev => ({ ...prev!, amenities: prev!.amenities.filter(a => a !== amenity) }));
    }
  };

  // CRUD operations
  const handleAddRoom = () => {
    const newId = rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1;
    setRooms(prev => [...prev, { ...newRoom, id: newId }]);
    setIsAddModalOpen(false);
  };

  const handleEditRoom = () => {
    if (currentRoom) {
      setRooms(prev => prev.map(room => room.id === currentRoom.id ? currentRoom : room));
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteRoom = () => {
    if (currentRoom) {
      setRooms(prev => prev.filter(room => room.id !== currentRoom.id));
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="room-management-container">
      <h2>Room Management</h2>
      <button className="add-room-btn" onClick={openAddModal}>
        Add New Room
      </button>

      <table className="rooms-table">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Floor</th>
            <th>Amenities</th>
            <th>Capacity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(room => (
            <tr key={room.id}>
              <td>{room.roomName}</td>
              <td>{room.floorNumber}</td>
              <td>{room.amenities.join(', ')}</td>
              <td>{room.capacity}</td>
              <td>
                <button className="edit-btn" onClick={() => openEditModal(room)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => openDeleteModal(room)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Room Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Room</h3>
            <div className="form-group">
              <label>Room Name:</label>
              <input
                type="text"
                name="roomName"
                value={newRoom.roomName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Floor Number:</label>
              <input
                type="text"
                name="floorNumber"
                value={newRoom.floorNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={newRoom.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Cover Photo URL:</label>
              <input
                type="text"
                name="coverPhoto"
                value={newRoom.coverPhoto}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Amenities:</label>
              <div className="amenities-container">
                {newRoom.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-tag">
                    {amenity}
                    <button onClick={() => handleRemoveAmenity(amenity)}>×</button>
                  </div>
                ))}
                <div className="add-amenity">
                  <input
                    type="text"
                    value={tempAmenity}
                    onChange={(e) => setTempAmenity(e.target.value)}
                    placeholder="Add amenity"
                  />
                  <button onClick={handleAddAmenity}>Add</button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddRoom}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && currentRoom && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Room</h3>
            <div className="form-group">
              <label>Room Name:</label>
              <input
                type="text"
                name="roomName"
                value={currentRoom.roomName}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Floor Number:</label>
              <input
                type="text"
                name="floorNumber"
                value={currentRoom.floorNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Capacity:</label>
              <input
                type="number"
                name="capacity"
                value={currentRoom.capacity}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Cover Photo URL:</label>
              <input
                type="text"
                name="coverPhoto"
                value={currentRoom.coverPhoto}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Amenities:</label>
              <div className="amenities-container">
                {currentRoom.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-tag">
                    {amenity}
                    <button onClick={() => handleRemoveAmenity(amenity)}>×</button>
                  </div>
                ))}
                <div className="add-amenity">
                  <input
                    type="text"
                    value={tempAmenity}
                    onChange={(e) => setTempAmenity(e.target.value)}
                    placeholder="Add amenity"
                  />
                  <button onClick={handleAddAmenity}>Add</button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleEditRoom}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentRoom && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {currentRoom.roomName}?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleDeleteRoom}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// export default AdminRoomManagement;