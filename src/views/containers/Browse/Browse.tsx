import React, { useState } from "react";
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

  const rooms: Room[] = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    name: `Room ${index + 1}`,
    floor: "17th Floor",
    image: "/assets/meeting-room2.jpg",
    amenities: [
      "Smart Boards",
      "Projection Screens",
      "Built-in TVs",
      "Speakers",
      "Boardroom table with power outlets",
    ],
    capacity: 12,
  }));

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
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button>SEARCH</button>
        </div>

        <div className="rooms-grid">
          {currentRooms.map((room) => (
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
          ))}
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
