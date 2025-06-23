import { useRef, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'
import Webcam from 'react-webcam'
import { API_URL } from '@/utils/env'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { UPLOAD_URL } from '@/utils/env'

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
  const authFetch = useAuthFetch()

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

    const fileExtension = capturedBlob.type.split('/')[1] || 'jpg'
    const fileName = `${user.userId}.${fileExtension}`
    const formData = new FormData()
    formData.append('files', capturedBlob, fileName)

    try {
      // שלב 1: העלאה עם fetch רגיל כדי להימנע משבירת content-type
      const uploadRes = await fetch(`${API_URL}/Upload?type=profile&id=${user.userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      })

      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status}`)
      }

      let uploadResponse: string[] = []
      try {
        uploadResponse = await uploadRes.json()
      } catch (parseErr) {
        throw new Error('Upload succeeded but response was not JSON.')
      }

      if (!Array.isArray(uploadResponse) || !uploadResponse[0]) {
        throw new Error('Upload failed: no path returned')
      }

      const relativePath = uploadResponse[0]
      const fullImageUrl = `${UPLOAD_URL}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`

      // שלב 2: עדכון URL במסד הנתונים עם authFetch
      await authFetch(`${API_URL}/User/ProfilePic/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullImageUrl),
      })

      onUploadSuccess(fullImageUrl)
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
            <img src={previewImage} alt="Preview" className="rounded mb-3" style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }} />
            <div className="d-flex justify-content-center gap-2">
              <Button variant="success" onClick={uploadImage}>
                Upload
              </Button>
              <Button variant="secondary" onClick={retakeImage}>
                Retake
              </Button>
            </div>
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
