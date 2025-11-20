import React, { useState, useEffect } from "react";
import { Header } from "../../../views/components/Header/Header";
import BookingModal from "../../../views/components/BookingModal/BookingModal";
import "./Browse.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Room = {
  id: number;
  name: string;
  floor: string;
  image: string;
  amenities: string[];
  capacity: number;
};

export const Browse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:64508/api/Room/GetRooms");
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      console.log('Fetched rooms:', data);
      
      // Transform backend data to match Room interface
      const formattedRooms: Room[] = data.map((room: any) => ({
        id: room.roomId,
        name: room.roomName,
        floor: room.floorNumber || "Unknown Floor",
        image: room.roomImage || "/assets/meeting-room2.jpg",
        amenities: room.amenities?.map((a: any) => a.amenityName) || [],
        capacity: room.capacity || 0,
      }));
      
      setRooms(formattedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Keep empty array on error
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedDate === "" || room.floor.includes(selectedDate))
    );
  });

  const roomsPerPage = 16;
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const currentRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  const openModal = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const navigateRoom = (direction: number) => {
    if (!selectedRoom) return;

    const currentIndex = filteredRooms.findIndex(
      (room) => room.id === selectedRoom.id
    );

    let newIndex = currentIndex + direction;

    if (newIndex < 0) {
      newIndex = filteredRooms.length - 1;
    } else if (newIndex >= filteredRooms.length) {
      newIndex = 0;
    }

    setSelectedRoom(filteredRooms[newIndex]);
  };

  return (
    <>
      <div className="browse-container">
        <Header />
        <div className="filter-section">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <button>SEARCH</button>
        </div>

        <div className="rooms-grid">
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>Loading rooms...</p>
            </div>
          ) : currentRooms.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>No rooms found</p>
            </div>
          ) : (
            currentRooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => openModal(room)}
              >
                <img src={room.image} alt={room.name} className="room-image" />
                <div className="room-details">
                  <p>{room.floor}</p>
                  <p>{room.name}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
            &lt;
          </button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}>
            &gt;
          </button>
        </div>
      </div>

      {isModalOpen && selectedRoom && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-wrapper">
            <button
              className="modal-arrow modal-arrow-left"
              onClick={(e) => {
                e.stopPropagation();
                navigateRoom(-1);
              }}
            >
              <FaChevronLeft />
            </button>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <span className="close" onClick={closeModal}>
                &times;
              </span>

              <img
                src={selectedRoom.image}
                alt={selectedRoom.name}
                className="modal-image"
              />

              <div className="modal-details">
                <h2>{selectedRoom.name.toUpperCase()}</h2>
                <p><strong>FLOOR:</strong> {selectedRoom.floor}</p>
                <p><strong>AMENITIES:</strong></p>
                <ul>
                  {selectedRoom.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
                <p><strong>Capacity:</strong> {selectedRoom.capacity}</p>

                <button
                  className="book-button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowBookingModal(true);
                  }}
                >
                  BOOK
                </button>
              </div>
            </div>

            <button
              className="modal-arrow modal-arrow-right"
              onClick={(e) => {
                e.stopPropagation();
                navigateRoom(1);
              }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={(goBack) => {
            setShowBookingModal(false);
            if (goBack) {
              setIsModalOpen(true); // return to preview modal
            }
          }}
        />
      )}
    </>
  );
};