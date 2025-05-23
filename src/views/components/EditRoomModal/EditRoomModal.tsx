import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col, Stack, Badge } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

type Room = {
  id: number;
  roomName: string;
  floorNumber: string;
  amenities: string[];
  capacity: number;
  coverPhoto: string;
};

interface EditRoomModalProps {
  show: boolean;
  onHide: () => void;
  room: Room;
  onSave: (updatedRoom: Room) => void;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ show, onHide, room, onSave }) => {
  const [editedRoom, setEditedRoom] = useState<Room>({ ...room });
  const [tempAmenity, setTempAmenity] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedRoom(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedRoom(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' ? parseInt(value) : value 
    }));
  };

  const handleAddAmenity = () => {
    if (tempAmenity.trim() && editedRoom.amenities.length < 5) {
      setEditedRoom(prev => ({
        ...prev,
        amenities: [...prev.amenities, tempAmenity.trim()]
      }));
      setTempAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setEditedRoom(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedRoom(prev => ({
          ...prev,
          coverPhoto: event.target?.result as string
        }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave(editedRoom);
    onHide();
  };

  const floorOptions = Array.from({ length: 17 }, (_, i) => (i + 1).toString());
  const capacityOptions = Array.from({ length: 50 }, (_, i) => (i + 1).toString());

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="editRoomName">
              <Form.Label>Room Name*</Form.Label>
              <Form.Control
                type="text"
                name="roomName"
                value={editedRoom.roomName}
                onChange={handleInputChange}
              />
            </Form.Group>
            
            <Form.Group as={Col} controlId="editFloorNumber">
              <Form.Label>Floor Number*</Form.Label>
              <Form.Select
                value={editedRoom.floorNumber}
                onChange={(e) => handleSelectChange('floorNumber', e.target.value)}
              >
                {floorOptions.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Cover Image</Form.Label>
            <div className="border rounded p-4 text-center">
              {editedRoom.coverPhoto && (
                <img 
                  src={editedRoom.coverPhoto} 
                  alt="Room preview" 
                  className="img-fluid mb-3"
                  style={{ maxHeight: '150px' }}
                />
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="editCoverUpload"
              />
              <Form.Label htmlFor="editCoverUpload" className="d-block cursor-pointer">
                <div>Click to upload or drag and drop</div>
                <small className="text-muted">SVG, PNG, JPG or GIF (max. 800×400px)</small>
              </Form.Label>
            </div>
          </Form.Group>

          <Row className="mb-3">
            <Form.Group as={Col} controlId="editCapacity">
              <Form.Label>Capacity*</Form.Label>
              <Form.Select
                value={editedRoom.capacity}
                onChange={(e) => handleSelectChange('capacity', e.target.value)}
              >
                {capacityOptions.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Amenities*</Form.Label>
            <p className="text-muted small mb-2">
              Add 1–5 keywords that describe this room's amenities.
            </p>
            <Stack direction="horizontal" gap={2} className="mb-2 flex-wrap">
              {editedRoom.amenities.map((amenity, i) => (
                <Badge key={i} bg="light" text="dark" className="d-flex align-items-center">
                  {amenity}
                  <FaTimes 
                    className="ms-2 cursor-pointer" 
                    onClick={() => handleRemoveAmenity(amenity)}
                  />
                </Badge>
              ))}
            </Stack>
            {editedRoom.amenities.length < 5 && (
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="e.g. whiteboard, video conferencing"
                  value={tempAmenity}
                  onChange={(e) => setTempAmenity(e.target.value)}
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={handleAddAmenity}
                  disabled={!tempAmenity.trim()}
                >
                  Add
                </Button>
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditRoomModal;