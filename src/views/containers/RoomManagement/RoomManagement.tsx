import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaWrench, FaSearch, FaPlus } from 'react-icons/fa';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { Modal, Button } from 'react-bootstrap';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { Header } from '../../components/Header/Header';
import './RoomManagement.css';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import EditRoomModal from '../../components/EditRoomModal/EditRoomModal';

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
  available: boolean;
  published?: boolean;
}

interface AddRoomModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
}

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:64508/api/Room/GetRooms');
      const data = await response.json();
      console.log('Fetched rooms:', data);
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.floorNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.amenities.some(amenity => amenity.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredRooms(filtered);
  };

  const handleAddRoom = async (newRoom: Omit<Room, 'id'>) => {
    try {
      const response = await fetch('http://localhost:64508/api/Room/Create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      });
      if (!response.ok) throw new Error('Failed to add room');
      await fetchRooms();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding room:', error);
      alert('Failed to add room. Please try again.');
    }
  };

  const handleEditRoom = async (updatedRoom: Room) => {
    try {
      console.log('Sending to server:', updatedRoom);
      const response = await fetch(`http://localhost:64508/api/Room/Update/${updatedRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRoom),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update room');
      }

      const data = await response.json();
      console.log('Server response:', data);
      await fetchRooms();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating room:', error);
      alert('Failed to update room. Please try again.');
    }
  };

  const handleDeleteRoom = async () => {
    if (!currentRoom) return;

    try {
      const response = await fetch(
        `http://localhost:64508/api/Room/Delete/${currentRoom.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete room');

      await fetchRooms();
      setShowDeleteModal(false);
      setCurrentRoom(null);
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete room. Please try again.');
    }
  };

  const handlePublishRoom = async (room: Room) => {
    try {
      const response = await fetch(
        `http://localhost:64508/api/Room/${room.id}/publish`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Failed to publish room');
      await fetchRooms();
    } catch (error) {
      console.error('Error publishing room:', error);
      alert('Failed to publish room. Please try again.');
    }
  };

  const handleUnpublishRoom = async (room: Room) => {
    try {
      const response = await fetch(
        `http://localhost:64508/api/Room/${room.id}/unpublish`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
      );
      if (!response.ok) throw new Error('Failed to unpublish room');
      await fetchRooms();
    } catch (error) {
      console.error('Error unpublishing room:', error);
      alert('Failed to unpublish room. Please try again.');
    }
  };

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Header />
      <div className="admin-layout">
        <Sidebar collapsed={sidebarCollapsed} />
        <div className="admin-content">
          <div className="room-management-main">
            <div className="room-management-header">
              <button
                className="sidebar-toggle-btn"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />}
              </button>
              <div>
                <h1>Meeting Rooms</h1>
                <p className="page-subtitle">Manage and configure meeting rooms</p>
              </div>
              <button 
                className="add-room-btn-header"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus /> Add Room
              </button>
            </div>

            {/* Search */}
            <div className="room-management-controls">
              <div className="search-box">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by room name, floor, or amenities..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Rooms Table */}
            <div className="room-management-table-container">
              <table className="room-management-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Floor</th>
                    <th>Capacity</th>
                    <th>Amenities</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        Loading rooms...
                      </td>
                    </tr>
                  ) : filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                        No rooms found
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room) => (
                      <tr key={room.id}>
                        <td>{room.roomName}</td>
                        <td>{room.floorNumber}</td>
                        <td>{room.capacity}</td>
                        <td>
                          <div className="amenities-list">
                            {room.amenities && room.amenities.length > 0 ? (
                              room.amenities.map((amenity, i) => (
                                <span key={i} className="amenity-badge">{amenity}</span>
                              ))
                            ) : (
                              <span className="amenity-badge">None</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${room.published ? 'published' : 'unpublished'}`}>
                            {room.published ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {room.published ? (
                              <button
                                className="action-btn unpublish-btn"
                                onClick={() => handleUnpublishRoom(room)}
                                title="Unpublish"
                              >
                                Hide
                              </button>
                            ) : (
                              <button
                                className="action-btn publish-btn"
                                onClick={() => handlePublishRoom(room)}
                                title="Publish"
                              >
                                Publish
                              </button>
                            )}
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => {
                                setCurrentRoom(room);
                                setShowEditModal(true);
                              }}
                              title="Edit"
                            >
                              <FaWrench />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => {
                                setCurrentRoom(room);
                                setShowDeleteModal(true);
                              }}
                              title="Delete"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modals */}
            <AddRoomModal
              show={showAddModal}
              onHide={() => setShowAddModal(false)}
              onSave={handleAddRoom}
              existingRooms={rooms}
            />

            {currentRoom && (
              <EditRoomModal
                show={showEditModal}
                onHide={() => {
                  setShowEditModal(false);
                  setCurrentRoom(null);
                }}
                room={currentRoom}
                onSave={handleEditRoom}
              />
            )}

            {currentRoom && (
              <Modal 
                show={showDeleteModal} 
                onHide={() => {
                  setShowDeleteModal(false);
                  setCurrentRoom(null);
                }}
                keyboard={false}
                aria-labelledby="contained-modal-title-vcenter"
                centered
                dialogClassName="modal-dialog-centered"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Are you sure you want to delete <strong>{currentRoom.roomName}</strong>? 
                  This will also delete all bookings for this room.
                </Modal.Body>
                <Modal.Footer>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setShowDeleteModal(false);
                      setCurrentRoom(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="danger"
                    className="delete-btn"
                    onClick={() => handleDeleteRoom()} 
                  >
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </>
  );
};