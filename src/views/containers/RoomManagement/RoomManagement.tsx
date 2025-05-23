import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaWrench, FaChevronUp, FaChevronDown, FaChevronCircleLeft, FaChevronCircleRight } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import './RoomManagement.css';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import EditRoomModal from '../../components/EditRoomModal/EditRoomModal';
import { Header } from '../../components/Header/Header';

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
}

interface AddRoomModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
}

export const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [sortKey, setSortKey] = useState<keyof Room>('roomName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(5);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3000/rooms');
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  const handleAddRoom = async (newRoom: Omit<Room, 'id'>) => {
  try {
    const response = await fetch('http://localhost:3000/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom), // Let server generate ID
    });
    if (!response.ok) throw new Error('Failed to add room');
    const addedRoom = await response.json();
    setRooms([...rooms, addedRoom]);
  } catch (error) {
    console.error('Error adding room:', error);
  }
};


const handleEditRoom = async (updatedRoom: Room) => {
  try {
    const response = await fetch(`http://localhost:3000/rooms/${updatedRoom.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRoom),
    });
    if (!response.ok) throw new Error('Failed to update room');
      const data = await response.json();
      setRooms(rooms.map(room => room.id === data.id ? data : room));
    } catch (error) {
      console.error('Error updating room:', error);
  }
};


const handleDeleteRoom = async () => {
  if (!currentRoom) return; // Early exit if no room selected

  try {
    // 1. Delete the room directly
    const response = await fetch(
      `http://localhost:3000/rooms/${currentRoom.id}`,
      { method: "DELETE" }
    );

    if (!response.ok) throw new Error("Failed to delete room");

    // 2. Update UI state
    setRooms((prevRooms) => 
      prevRooms.filter((room) => room.id !== currentRoom.id)
    );
    setShowDeleteModal(false);

    // Optional: Notify user of success
    alert("Room deleted successfully!");
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete room. Please try again.");
  }
};

const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearch(e.target.value.trim().toLowerCase());
  setCurrentPage(1);
};

const handleSort = (key: keyof Room) => {
  if (key === sortKey) {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortKey(key);
    setSortDirection('asc');
  }
  setCurrentPage(1);
};

const filteredRooms = rooms.filter(room => {
  return room.roomName.toLowerCase().includes(search) ||
          room.floorNumber.toString().includes(search) ||
          room.amenities.some(amenity => amenity.toLowerCase().includes(search)) ||
          room.capacity.toString().includes(search);
}
);


const sortedRooms = filteredRooms.slice().sort((a, b) => {
  const aVal = a[sortKey];
  const bVal = b[sortKey];

  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
  if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return sortDirection === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  }

  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  }

  if (Array.isArray(aVal) && Array.isArray(bVal)) {
    const aStr = aVal.join(', ').toLowerCase();
    const bStr = bVal.join(', ').toLowerCase();
    return sortDirection === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  }

  return 0;
});

const totalPages = Math.max(1, Math.ceil(sortedRooms.length / roomsPerPage));
const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
const indexOfLastRoom = safeCurrentPage * roomsPerPage;
const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
const currentRooms = sortedRooms.slice(indexOfFirstRoom, indexOfLastRoom);


  return (
    <div className="room-management-page">
      <Header />
      <div className="room-management-content">
        <div className="room-management-header">
          <p className="manage-rooms-heading">Manage Rooms</p>
          <div className="search-and-add">
            <input
              type="text"
              className="search-input"
              placeholder="Search rooms..."
              value={search}
              onChange={handleSearch}
            />
            <button 
              className="add-room-btn" 
              onClick={() => setShowAddModal(true)}
            >
              Add New Room
            </button>
          </div>
        </div>

        <div className="room-table-wrapper">
          <table className="room-table">
            <thead>
              <tr>
                {/* <th onClick={() => handleSort('roomName')}>
                  Room Name {sortKey === 'roomName' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th onClick={() => handleSort('floorNumber')}>
                  Floor {sortKey === 'floorNumber' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th> */}
                {/* <th onClick={() => handleSort('capacity')}>
                  Capacity {sortKey === 'capacity' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th> */}
                <th>Room Name</th>
                <th>Floor Number</th>
                <th>Amenities</th>
                <th>Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map(room => (
                <tr key={room.id}>
                  <td>{room.roomName}</td>
                  <td>{room.floorNumber}</td>
                  <td>
                    <div className="amenities-list">
                      {room.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-badge">{amenity}</span>
                      ))}
                    </div>
                  </td>
                  <td>{room.capacity}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn" 
                        onClick={() => {
                          setCurrentRoom(room);
                          setShowEditModal(true);
                        }}
                      >
                        <FaWrench />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => {
                          setCurrentRoom(room);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <FaChevronCircleLeft />
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <FaChevronCircleRight />
            </button>
          </div>

        <AddRoomModal
          show={showAddModal}
          onHide={() => setShowAddModal(false)}
          onSave={handleAddRoom}
        />

        {currentRoom && (
          <EditRoomModal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
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
            
            // backdrop="static"
            keyboard={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
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
                // bootstrap for delete button
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
  );
};