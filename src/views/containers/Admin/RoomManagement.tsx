
import React, { useState, useEffect } from "react";
import { FaChevronUp, FaChevronDown, FaTrashAlt, FaWrench } from "react-icons/fa";
import { Header } from "../../components/Header/Header";
import "./RoomManagement.css";

type Room = {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
};

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState<Omit<Room, 'id'>>({ 
    roomName: '',
    floorNumber: '1',
    amenities: [],
    capacity: 1,
    coverPhoto: '',
  });
  const [tempAmenity, setTempAmenity] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Room>('roomName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch rooms from db.json
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3001/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  // Handle sorting
  const handleSort = (key: keyof Room) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter and sort rooms
  const filteredRooms = [...rooms]
    .filter(room => 
      room.roomName.toLowerCase().includes(search.toLowerCase()) ||
      room.floorNumber.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = String(a[sortKey]).toLowerCase();
      const bVal = String(b[sortKey]).toLowerCase();
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Modal handlers
  const openAddModal = () => {
    setNewRoom({ 
      roomName: '',
      floorNumber: '1',
      amenities: [],
      capacity: 1,
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

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (isAddModalOpen) {
      setNewRoom(prev => ({ ...prev, [name]: name === 'capacity' ? parseInt(value) : value }));
    } else if (isEditModalOpen && currentRoom) {
      setCurrentRoom(prev => ({ ...prev!, [name]: name === 'capacity' ? parseInt(value) : value }));
    }
  };

  const handleAddAmenity = () => {
    if (tempAmenity.trim() && (isAddModalOpen ? newRoom.amenities.length < 5 : currentRoom?.amenities.length! < 5)) {
      if (isAddModalOpen) {
        setNewRoom(prev => ({ ...prev, amenities: [...prev.amenities, tempAmenity.trim()] }));
      } else if (isEditModalOpen && currentRoom) {
        setCurrentRoom(prev => ({ ...prev!, amenities: [...prev!.amenities, tempAmenity.trim()] }));
      }
      setTempAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    if (isAddModalOpen) {
      setNewRoom(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity) }));
    } else if (isEditModalOpen && currentRoom) {
      setCurrentRoom(prev => ({ ...prev!, amenities: prev!.amenities.filter(a => a !== amenity) }));
    }
  };

  // CRUD operations with db.json
  const handleAddRoom = async () => {
    try {
      const response = await fetch('http://localhost:3001/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newRoom,
          id: rooms.length > 0 ? Math.max(...rooms.map(r => r.id)) + 1 : 1
        }),
      });
      const addedRoom = await response.json();
      setRooms(prev => [...prev, addedRoom]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleEditRoom = async () => {
    if (!currentRoom) return;
    
    try {
      const response = await fetch(`http://localhost:3001/rooms/${currentRoom.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentRoom),
      });
      const updatedRoom = await response.json();
      setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  };

  const handleDeleteRoom = async () => {
    if (!currentRoom) return;
    
    try {
      await fetch(`http://localhost:3001/rooms/${currentRoom.id}`, {
        method: 'DELETE',
      });
      setRooms(prev => prev.filter(room => room.id !== currentRoom.id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  // Generate floor and capacity options
  const floorOptions = Array.from({ length: 17 }, (_, i) => i + 1);
  const capacityOptions = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="admin-room-management-page">
      <Header />
      <div className="admin-room-management-content">
        <div className="admin-room-management-header">
          <h1 className="manage-rooms-heading">Manage Rooms</h1>
          <div className="search-and-add">
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-room-btn" onClick={openAddModal}>
              Add New Room
            </button>
          </div>
        </div>

        <div className="room-table-wrapper">
          <table className="room-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('roomName')}>
                  Room Name {sortKey === 'roomName' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th onClick={() => handleSort('floorNumber')}>
                  Floor {sortKey === 'floorNumber' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th>Amenities</th>
                <th onClick={() => handleSort('capacity')}>
                  Capacity {sortKey === 'capacity' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map(room => (
                <tr key={room.id}>
                  <td>{room.roomName}</td>
                  <td>{room.floorNumber}</td>
                  <td>{room.amenities.join(', ')}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <button className="action-btn" onClick={() => openEditModal(room)}>
                      <FaWrench />
                    </button>
                    <button className="action-btn delete" onClick={() => openDeleteModal(room)}>
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Room Modal */}
        {isAddModalOpen && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Add New Room</h3>
              <p>Set up a new room for bookings.</p>
              
              <div className="form-group">
                <label>Room Name*</label>
                <input
                  type="text"
                  name="roomName"
                  value={newRoom.roomName}
                  onChange={handleInputChange}
                  placeholder="e.g. Linear"
                />
              </div>
              
              <div className="form-group">
                <label>Floor Number*</label>
                <select
                  name="floorNumber"
                  value={newRoom.floorNumber}
                  onChange={handleInputChange}
                >
                  {floorOptions.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Cover Image*</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setNewRoom(prev => ({ ...prev, coverPhoto: event.target?.result as string }));
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="upload-placeholder">
                    Click to upload or drag and drop
                    <div className="file-types">SVG, PNG, JPG or GIF. Max 800x400px</div>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label>Capacity*</label>
                <select
                  name="capacity"
                  value={newRoom.capacity}
                  onChange={handleInputChange}
                >
                  {capacityOptions.map(capacity => (
                    <option key={capacity} value={capacity}>{capacity}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Amenities*</label>
                <p className="amenities-description">Add 1-5 keywords that describe this room's amenities.</p>
                <div className="amenities-container">
                  {newRoom.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-tag">
                      {amenity}
                      <button onClick={() => handleRemoveAmenity(amenity)}>×</button>
                    </div>
                  ))}
                  {newRoom.amenities.length < 5 && (
                    <div className="add-amenity">
                      <input
                        type="text"
                        value={tempAmenity}
                        onChange={(e) => setTempAmenity(e.target.value)}
                        placeholder="e.g. whiteboard, video conferencing"
                      />
                      <button onClick={handleAddAmenity}>Add</button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleAddRoom} disabled={!newRoom.roomName || newRoom.amenities.length === 0}>
                  Confirm
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
                <label>Room Name*</label>
                <input
                  type="text"
                  name="roomName"
                  value={currentRoom.roomName}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Floor Number*</label>
                <select
                  name="floorNumber"
                  value={currentRoom.floorNumber}
                  onChange={handleInputChange}
                >
                  {floorOptions.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Cover Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setCurrentRoom(prev => ({ ...prev!, coverPhoto: event.target?.result as string }));
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                  {currentRoom.coverPhoto ? (
                    <img src={currentRoom.coverPhoto} alt="Room cover" className="room-cover-preview" />
                  ) : (
                    <div className="upload-placeholder">
                      Click to upload or drag and drop
                      <div className="file-types">SVG, PNG, JPG or GIF. Max 800x400px</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Capacity*</label>
                <select
                  name="capacity"
                  value={currentRoom.capacity}
                  onChange={handleInputChange}
                >
                  {capacityOptions.map(capacity => (
                    <option key={capacity} value={capacity}>{capacity}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Amenities*</label>
                <div className="amenities-container">
                  {currentRoom.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-tag">
                      {amenity}
                      <button onClick={() => handleRemoveAmenity(amenity)}>×</button>
                    </div>
                  ))}
                  {currentRoom.amenities.length < 5 && (
                    <div className="add-amenity">
                      <input
                        type="text"
                        value={tempAmenity}
                        onChange={(e) => setTempAmenity(e.target.value)}
                        placeholder="Add amenity"
                      />
                      <button onClick={handleAddAmenity}>Add</button>
                    </div>
                  )}
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
    </div>
  );
};

export default RoomManagement;