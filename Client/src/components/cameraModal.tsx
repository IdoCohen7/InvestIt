import { useRef, useState, useEffect } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { useAuthContext } from '@/context/useAuthContext'

interface CameraModalProps {
  show: boolean
  onClose: () => void
  onUploadSuccess: (newPicUrl: string) => void
}

const CameraModal = ({ show, onClose, onUploadSuccess }: CameraModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const { user } = useAuthContext()

  useEffect(() => {
    if (show && !previewImage) {
      navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
          setStream(mediaStream)
        }
      })
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
    }
  }, [show, previewImage])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setCapturedBlob(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) return

      setCapturedBlob(blob)

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
          setStream(null)
        }
      }
      reader.readAsDataURL(blob)
    }, 'image/jpeg')
  }

  const uploadImage = async () => {
    if (!capturedBlob || !user) return

    const formData = new FormData()
    formData.append('files', capturedBlob, `${user.userId}.jpg`)

    try {
      const uploadRes = await fetch(`https://localhost:7204/api/Upload?type=profile&id=${user.userId}`, {
        method: 'POST',
        body: formData,
      })

      const [uploadedPath] = await uploadRes.json()
      if (!uploadedPath) throw new Error('Upload failed')

      const updateRes = await fetch(`https://localhost:7204/api/User/ProfilePic/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadedPath),
      })

      if (!updateRes.ok) throw new Error('Failed to update profile pic')

      onUploadSuccess(`/uploadedFiles/${uploadedPath}`)
      setPreviewImage(null)
      onClose()
    } catch (err) {
      console.error('Error uploading image:', err)
    }
  }

  const retakeImage = () => {
    setPreviewImage(null)
    setCapturedBlob(null)
    navigator.mediaDevices.getUserMedia({ video: true }).then((mediaStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    })
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
              {stream ? 'Retake' : 'Take Photo'}
            </Button>
          </>
        ) : (
          <>
            <div className="mb-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Button variant="primary" className="me-2" onClick={() => fileInputRef.current?.click()}>
                Choose from Computer
              </Button>
              <Button variant="secondary" onClick={captureImage}>
                Take Photo
              </Button>
            </div>
            <video ref={videoRef} autoPlay playsInline className="rounded w-100" />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default CameraModal
