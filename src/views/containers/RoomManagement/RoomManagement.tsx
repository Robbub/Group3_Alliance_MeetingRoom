import React, { useState, useEffect, useMemo } from 'react';
import { FaTrashAlt, FaWrench, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { Header } from '../../components/Header/Header';
import './RoomManagement.css';
import AddRoomModal from '../../components/AddRoomModal/AddRoomModal';
import EditRoomModal from '../../components/EditRoomModal/EditRoomModal';

interface Amenity {
  id: number;
  name: string;
  description: string;
}

interface Room {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: Amenity[]; // Change to Amenity object array
  capacity: number;
  coverPhoto: string;
  available: boolean;
}

const API_BASE_URL = "http://localhost:64508/api/Room"; // Backend API base URL
const AMENITIES_API_URL = `${API_BASE_URL}/GetAmenities`;

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'roomName' | 'floorNumber' | 'capacity'>('roomName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage] = useState(7); // Match user management
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]); // Store all amenities for dropdown

  // Fetch all amenities on component mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(AMENITIES_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch amenities: ${response.status}`);
        }
        const data: Amenity[] = await response.json();
        setAllAmenities(data);
      } catch (error) {
        console.error("Error fetching amenities:", error);
        alert("Failed to load amenities. Please try again later.");
      }
    };

    fetchAmenities();
  }, []);

  // Fetch rooms on component mount and when amenities are loaded
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/GetRooms`); // Assuming your controller has this endpoint
        if (!response.ok) {
          throw new Error(`Failed to fetch rooms: ${response.status}`);
        }
        const data: Room[] = await response.json();
        // Map string amenities to objects if the API returns them as strings
        // If the API returns objects, this step might be unnecessary
        const roomsWithObjectAmenities = data.map(room => ({
          ...room,
          amenities: room.amenities.map(amenity => {
            // If amenity is a string, find the corresponding object from allAmenities
            if (typeof amenity === 'string') {
              return allAmenities.find(a => a.name === amenity) || { id: 0, name: amenity, description: '' };
            }
            // If amenity is already an object, return it as is
            return amenity;
          })
        }));
        setRooms(roomsWithObjectAmenities);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        setRooms([]);
      }
    };

    if (allAmenities.length > 0) { // Only fetch rooms after amenities are loaded
      fetchRooms();
    }
  }, [allAmenities]); // Dependency on allAmenities to refetch if needed

  const handleAddRoom = async (newRoom: Omit<Room, 'id'>) => {
      try {
          console.log('Adding room:', newRoom);
          // Extract amenity IDs
          const amenityIds = newRoom.amenities.map(a => a.id); // Map to IDs
          const response = await fetch(`${API_BASE_URL}/AddRoom`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  ...newRoom,
                  amenities: amenityIds // Send only the IDs to the backend
              }),
          });

          if (!response.ok) {
              const errorData = await response.text();
              throw new Error(errorData || "Failed to add room");
          }

          const addedRoomData: { message: string } = await response.json();
          alert(addedRoomData.message);

          // Refetch rooms to get the updated list with the new room
          const updatedResponse = await fetch(`${API_BASE_URL}/GetRooms`);
          if (!updatedResponse.ok) {
              throw new Error(`Failed to fetch rooms after add: ${updatedResponse.status}`);
          }
          const updatedRooms: Room[] = await updatedResponse.json();
          setRooms(updatedRooms);
          setShowAddModal(false);

      } catch (error) {
          console.error("Error adding room:", error);
          alert(error instanceof Error ? error.message : "Failed to add room. Please try again.");
      }
  };

  // Handle editing a room
  const handleEditRoom = async (updatedRoom: Room) => {
      try {
          console.log('Updating room:', updatedRoom);
          // Extract amenity IDs
          const amenityIds = updatedRoom.amenities.map(a => a.id); // Map to IDs
          const response = await fetch(`${API_BASE_URL}/UpdateRoom/${updatedRoom.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  ...updatedRoom,
                  amenities: amenityIds // Send only the IDs to the backend
              }),
          });

          if (!response.ok) {
              const errorData = await response.text();
              throw new Error(errorData || "Failed to update room");
          }

          const updatedRoomData: { message: string } = await response.json();
          alert(updatedRoomData.message);

          // Update local state optimistically or refetch
          setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
          setShowEditModal(false);
          setCurrentRoom(null);

      } catch (error) {
          console.error("Error updating room:", error);
          alert(error instanceof Error ? error.message : "Failed to update room. Please try again.");
      }
  };

  // Handle deleting a room
  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this room?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/DeleteRoom/${id}`, { // Assuming your controller has this endpoint
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Failed to delete room: ${response.status}`);
      }

      const deletedRoomData: { message: string } = await response.json();
      alert(deletedRoomData.message);

      // Update local state
      setRooms(prev => prev.filter(room => room.id !== id));

    } catch (error) {
      console.error("Error deleting room:", error);
      alert(error instanceof Error ? error.message : "Failed to delete room. Please try again.");
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.trim().toLowerCase());
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sorting
  const handleSort = (key: 'roomName' | 'floorNumber' | 'capacity') => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  // Filter and sort rooms
  const filteredAndSortedRooms = useMemo(() => {
    let filtered = rooms.filter(room =>
      room.roomName.toLowerCase().includes(search) ||
      room.floorNumber.toLowerCase().includes(search) ||
      room.amenities.some(a => a.name.toLowerCase().includes(search)) // Check amenities too
    );

    filtered.sort((a, b) => {
      if (sortKey === 'roomName') {
        return sortDirection === 'asc' ? a.roomName.localeCompare(b.roomName) : b.roomName.localeCompare(a.roomName);
      } else if (sortKey === 'floorNumber') {
        return sortDirection === 'asc' ? a.floorNumber.localeCompare(b.floorNumber) : b.floorNumber.localeCompare(a.floorNumber);
      } else if (sortKey === 'capacity') {
        return sortDirection === 'asc' ? a.capacity - b.capacity : b.capacity - a.capacity;
      }
      return 0;
    });

    return filtered;
  }, [rooms, search, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedRooms.length / roomsPerPage);
  const paginatedRooms = filteredAndSortedRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Icons for sorting
  const getSortIcon = (key: 'roomName' | 'floorNumber' | 'capacity') => {
    if (sortKey === key) {
      return sortDirection === 'asc' ? <FaChevronUp /> : <FaChevronDown />;
    }
    return null;
  };

  return (
    <div className="room-management-page">
      <Header />
      <div className="room-management-content">
        <div className="room-management-header">
          <h1 className="room-management-title">Room Management</h1>
          <button className="add-room-btn" onClick={() => setShowAddModal(true)}>
            Add Room
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <div className="table-container">
          <table className="room-table">
            <thead>
              <tr>
                {/* Define explicit widths for each column */}
                <th style={{ width: '20%' }}>Room Name {getSortIcon('roomName')}</th>
                <th style={{ width: '10%' }}>Floor Number {getSortIcon('floorNumber')}</th>
                <th style={{ width: '15%' }}>Photo</th>
                <th style={{ width: '10%' }}>Capacity {getSortIcon('capacity')}</th>
                <th style={{ width: '30%' }}>Amenities</th>
                <th style={{ width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.roomName}</td>
                  <td>{room.floorNumber}</td>
                  <td>
                    {room.coverPhoto ? (
                      <img src={room.coverPhoto} alt={room.roomName} className="room-photo" />
                    ) : (
                      <div className="room-photo-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{room.capacity}</td>
                  <td>
                    <div className="amenities-list">
                      {room.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-badge">
                          {amenity.name}
                        </span>
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddRoomModal
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            onSave={handleAddRoom}
            existingRooms={rooms}
            allAmenities={allAmenities}
          />
        )}

        {showEditModal && currentRoom && (
          <EditRoomModal
            show={showEditModal}
            onHide={() => {
              setShowEditModal(false);
              setCurrentRoom(null);
            }}
            room={currentRoom}
            onSave={handleEditRoom}
            allAmenities={allAmenities}
          />
        )}
      </div>
    </div>
  );
};

export default RoomManagement;