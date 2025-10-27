import React, { useState, useEffect } from 'react';
import { FaTrashAlt, FaWrench, FaChevronUp, FaChevronDown } from 'react-icons/fa';
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
}

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [sortKey, setSortKey] = useState<keyof Room>('roomName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 7;

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:3000/rooms");
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  };

  // Handle adding a new room
  const handleAddRoom = async (newRoom: Omit<Room, 'id'>) => {
    try {
      console.log('Adding room:', newRoom);
      
      const response = await fetch("http://localhost:3000/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });
      
      if (!response.ok) throw new Error("Failed to add room");
      
      const addedRoom = await response.json();
      console.log('Room added successfully:', addedRoom);
      
      // Update local state with the room that has an ID from server
      setRooms(prev => [...prev, addedRoom]);
      
      // Trigger event for Browse component to refresh
      window.dispatchEvent(new CustomEvent('roomsUpdated'));
      
      // Show success message only once
      alert("Room added successfully!");
      
    } catch (error) {
      console.error("Error adding room:", error);
      alert("Failed to add room. Please try again.");
    }
  };

  // Handle editing a room
  const handleEditRoom = async (updatedRoom: Room) => {
    try {
      const response = await fetch(`http://localhost:3000/rooms/${updatedRoom.id}`, {
        method: "PUT", // Changed from PATCH to PUT for complete replacement
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      });
      
      if (!response.ok) throw new Error("Failed to update room");
      
      // Update local state
      setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
      setShowEditModal(false);
      setCurrentRoom(null);
      
      // Trigger event for Browse component to refresh
      window.dispatchEvent(new CustomEvent('roomsUpdated'));
      
      alert("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Failed to update room. Please try again.");
    }
  };

  // Handle deleting a room
  const handleDeleteRoom = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        console.log(`Deleting room with ID: ${id}`);
        
        const response = await fetch(`http://localhost:3000/rooms/${id}`, {
          method: "DELETE",
        });
        
        console.log(`Delete response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Failed to delete room: ${response.status}`);
        }
        
        // Update local state
        setRooms(prev => prev.filter(room => room.id !== id));
        
        // Trigger event for Browse component to refresh
        window.dispatchEvent(new CustomEvent('roomsUpdated'));
        
        alert("Room deleted successfully!");
      } catch (error) {
        console.error("Error deleting room:", error);
        alert("Failed to delete room. Please try again.");
      }
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().toLowerCase());
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (key: keyof Room) => {
    if (key === sortKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Filter and sort rooms
  const filteredRooms = rooms.filter(room => {
    return (
      room.roomName.toLowerCase().includes(search) ||
      room.floorNumber.toLowerCase().includes(search) ||
      room.amenities.some(amenity => amenity.toLowerCase().includes(search)) ||
      room.capacity.toString().includes(search)
    );
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedRooms.length / roomsPerPage));
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = sortedRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  return (
    <div className="room-management-page">
      <Header />
      <div className="room-management-content">
        <div className="room-management-header">
          <h1 className="manage-rooms-heading">Manage Rooms</h1>
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
                <th onClick={() => handleSort('roomName')} className="sortable">
                  Room Name {sortKey === 'roomName' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th onClick={() => handleSort('floorNumber')} className="sortable">
                  Floor {sortKey === 'floorNumber' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th onClick={() => handleSort('capacity')} className="sortable">
                  Capacity {sortKey === 'capacity' && (sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                </th>
                <th>Amenities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRooms.map(room => (
                <tr key={room.id}>
                  <td>{room.roomName}</td>
                  <td>{room.floorNumber}</td>
                  <td>{room.capacity}</td>
                  <td>
                    <div className="amenities-list">
                      {room.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-badge">{amenity}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        onClick={() => {
                          setCurrentRoom(room);
                          setShowEditModal(true);
                        }}
                        title="Edit Room"
                      >
                        <FaWrench />
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteRoom(room.id)}
                        title="Delete Room"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              disabled={currentPage === 1}
            >
              ‹
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-number ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default RoomManagement;