import { useRef, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import Webcam from 'react-webcam'
import { API_URL } from '@/utils/env'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthFetch } from '@/hooks/useAuthFetch' // ייבוא useAuthFetch

interface CameraModalProps {
  show: boolean
  onClose: () => void
  onUploadSuccess: (newPicUrl: string) => void
}

const CameraModal = ({ show, onClose, onUploadSuccess }: CameraModalProps) => {
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const { user } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const authFetch = useAuthFetch() // שימוש ב-hook החדש

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCapturedBlob(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const captureImage = () => {
    if (!webcamRef.current) return
    const screenshot = webcamRef.current.getScreenshot()
    if (!screenshot) return

    fetch(screenshot)
      .then((res) => res.blob())
      .then((blob) => {
        setCapturedBlob(blob)
        setPreviewImage(screenshot)
      })
  }

  const uploadImage = async () => {
    if (!capturedBlob || !user) return

    const formData = new FormData()
    formData.append('files', capturedBlob, `${user.userId}.jpg`)

    try {
      const uploadRes = await authFetch(`${API_URL}/Upload?type=profile&id=${user.userId}`, {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes || !Array.isArray(uploadRes) || !uploadRes[0]) {
        throw new Error('Upload failed: no path returned')
      }

      const uploadedPath = uploadRes[0]

      const updateRes = await authFetch(`${API_URL}/User/ProfilePic/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadedPath),
      })

      if (!updateRes) {
        throw new Error('Failed to update profile pic')
      }

      onUploadSuccess(`/uploadedFiles/${uploadedPath}`)
      setPreviewImage(null)
      onClose()
    } catch (err) {
      console.error('Error uploading image:', err)
      showNotification({ message: 'Failed to upload image. Please try again.', variant: 'danger' })
    }
  }

  const retakeImage = () => {
    setPreviewImage(null)
    setCapturedBlob(null)
  }

  return (
    <Modal
      show={show}
      onHide={() => {
        setPreviewImage(null)
        onClose()
      }}
      centered
      size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update Profile Picture</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {previewImage ? (
          <>
            <img src={previewImage} alt="Preview" className="rounded w-100 mb-3" />
            <Button variant="success" className="me-2" onClick={uploadImage}>
              Upload
            </Button>
            <Button variant="secondary" onClick={retakeImage}>
              Retake
            </Button>
          </>
        ) : (
          <>
            <div className="mb-3">
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <Button variant="primary" className="me-2" onClick={() => fileInputRef.current?.click()}>
                Choose from Computer
              </Button>
              <Button variant="secondary" onClick={captureImage}>
                Take Photo
              </Button>
            </div>
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded w-100" videoConstraints={{ facingMode: 'user' }} />
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default CameraModal
