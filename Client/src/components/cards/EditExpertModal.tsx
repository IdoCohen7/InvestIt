// components/ExpertEditModal.tsx
import { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'

interface Props {
  show: boolean
  onClose: () => void
  currentExpertData: {
    expertiseArea: string
    price: number
    availableForChat: boolean
  }
  onSave: (updated: { expertiseArea: string; price: number; availableForChat: boolean }) => void
}

const ExpertEditModal = ({ show, onClose, currentExpertData, onSave }: Props) => {
  const [expertiseArea, setExpertiseArea] = useState(currentExpertData.expertiseArea)
  const [price, setPrice] = useState(currentExpertData.price)
  const [availableForChat, setAvailableForChat] = useState(currentExpertData.availableForChat)

  const handleSubmit = () => {
    onSave({ expertiseArea, price, availableForChat })
    onClose()
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Expert Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="expertiseArea" className="mb-3">
            <Form.Label>Expertise Area</Form.Label>
            <Form.Control type="text" value={expertiseArea} onChange={(e) => setExpertiseArea(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="price" className="mb-3">
            <Form.Label>Price ($)</Form.Label>
            <Form.Control type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </Form.Group>
          <Form.Group controlId="availableForChat">
            <Form.Check
              type="checkbox"
              label="Available for Chat"
              checked={availableForChat}
              onChange={(e) => setAvailableForChat(e.target.checked)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ExpertEditModal
