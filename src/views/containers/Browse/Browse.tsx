import React, { useState, useEffect } from "react";
import { Header } from "../../../views/components/Header/Header";
import BookingModal from "../../../views/components/BookingModal/BookingModal";
import "./Browse.css";
import { useSearchParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Room = {
  id: number;
  name: string;
  floor: string;
  image: string;
  amenities: string[];
  capacity: number;
};

// Fallback data in case server is down
const fallbackRooms: Room[] = [
  {
    id: 1,
    name: "Board Room",
    floor: "6th Floor",
    image: "/assets/meeting-room2.jpg",
    amenities: ["Air-con", "Whiteboard", "Projector", "Video Conferencing"],
    capacity: 12,
  },
  {
    id: 2,
    name: "Innovation Hub",
    floor: "6th Floor",
    image: "/assets/meeting-room7.png",
    amenities: ["Air-con", "Smart TV", "Whiteboard", "Coffee Machine"],
    capacity: 8,
  },
  {
    id: 3,
    name: "Strategy Room",
    floor: "7th Floor",
    image: "/assets/meeting-room4.png",
    amenities: ["Air-con", "Projector", "Ergonomic Chairs"],
    capacity: 6,
  },
  {
    id: 4,
    name: "Collaboration Space",
    floor: "7th Floor",
    image: "/assets/meeting-room5.jpg",
    amenities: ["Air-con", "Whiteboard", "Standing Desks", "Video Conferencing"],
    capacity: 10,
  },
  {
    id: 5,
    name: "Executive Suite",
    floor: "8th Floor",
    image: "/assets/meeting-room6.png",
    amenities: ["Air-con", "Leather Chairs", "Privacy Glass", "Mini Fridge"],
    capacity: 4,
  },
];

export const Browse = () => {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [searchParams] = useSearchParams();
  const amenitiesParam = searchParams.get("amenities");
  const initialAmenities = amenitiesParam ? decodeURIComponent(amenitiesParam).split(",") : [];

  const date = searchParams.get("date") || "";
  const startTime = searchParams.get("startTime") || "09:00";
  const endTime = searchParams.get("endTime") || "15:00";
  const title = searchParams.get("title") || "";
  const endDate = searchParams.get("endDate") || "";

  // Fetch rooms from server
  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3000/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      
      const roomsData = await response.json();
      console.log('Fetched rooms data:', roomsData);
      
      // Transform server data to Browse format
      const transformedRooms: Room[] = roomsData.map((room: any) => ({
        id: room.id,
        name: room.roomName,
        floor: `${getFloorSuffix(room.floorNumber)} Floor`,
        image: room.coverPhoto || getDefaultImage(room.id),
        amenities: room.amenities || [],
        capacity: room.capacity,
      }));
      
      setAllRooms(transformedRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Use fallback data if server is down
      setAllRooms(fallbackRooms);
    }
  };

  // Helper function to get floor suffix
  const getFloorSuffix = (floor: string | number) => {
    const num = typeof floor === 'string' ? parseInt(floor) : floor;
    if (num === 1) return '1st';
    if (num === 2) return '2nd';
    if (num === 3) return '3rd';
    return `${num}th`;
  };

  // Helper function to get default image
  const getDefaultImage = (id: number) => {
    const images = [
      "/assets/meeting-room2.jpg",
      "/assets/meeting-room7.png",
      "/assets/meeting-room4.png",
      "/assets/meeting-room5.jpg",
      "/assets/meeting-room6.png"
    ];
    return images[(id - 1) % images.length];
  };

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, []);

  // Listen for room updates from RoomManagement
  useEffect(() => {
    let isUpdating = false;
    
    const handleRoomsUpdate = () => {
      if (isUpdating) return; // Prevent multiple simultaneous updates
      isUpdating = true;
      
      console.log('Rooms updated event received, refetching...');
      fetchRooms().finally(() => {
        isUpdating = false;
      });
    };

    window.addEventListener('roomsUpdated', handleRoomsUpdate);

    return () => {
      window.removeEventListener('roomsUpdated', handleRoomsUpdate);
    };
  }, []);

  const filteredRooms = allRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAmenities = initialAmenities.length === 0 || 
      initialAmenities.every(amenity => room.amenities.includes(amenity));
    
    return matchesSearch && matchesAmenities;
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
          {currentRooms.map((room) => (
            <div
              key={room.id}
              className="room-card"
              onClick={() => openModal(room)}
            >
              <img 
                src={room.image} 
                alt={room.name} 
                className="room-image"
                onError={(e) => {
                  // Fallback to default image if current image fails
                  e.currentTarget.src = getDefaultImage(room.id);
                }}
              />
              <div className="room-details">
                <p>{room.floor}</p>
                <p>{room.name}</p>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
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
        )}
      </div>

      {isModalOpen && selectedRoom && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="browse-modal-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
            <button
              className="browse-modal-arrow browse-modal-arrow-left"
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                navigateRoom(-1);
              }}
            >
              &#x2039;
            </button>
            <button
              className="browse-modal-arrow browse-modal-arrow-right"
              style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                navigateRoom(1);
              }}
            >
              &#x203A;
            </button>
            <span className="close" onClick={closeModal} style={{ position: 'absolute', top: 20, right: 25 }}>
              &times;
            </span>
            <div style={{ width: 320, height: 200, marginBottom: 0 }}>
              <img
                src={selectedRoom.image}
                alt={selectedRoom.name}
                className="modal-image"
                onError={(e) => {
                  e.currentTarget.src = getDefaultImage(selectedRoom.id);
                }}
              />
            </div>
            <div className="modal-divider"></div>
            <div className="modal-details">
              <h2>{selectedRoom.name.toUpperCase()}</h2>
              <p className="modal-label">FLOOR</p>
              <p>{selectedRoom.floor}</p>
              <p className="modal-label">AMENITIES</p>
              <ul>
                {selectedRoom.amenities.map((amenity, index) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
              <p className="modal-label" style={{ marginTop: 10 }}>CAPACITY</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{selectedRoom.capacity}</p>
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
        </div>
      )}

      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          bookingData={{
            date,
            startTime,
            endTime,
            purpose: title,
            amenities: initialAmenities,
            endDate: endDate
          }}
          onClose={(goBack) => {
            setShowBookingModal(false);
            if (goBack) {
              setIsModalOpen(true);
            }
          }}
        />
      )}
    </>
  );
};