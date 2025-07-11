import { useState } from 'react'
import { Card } from 'react-bootstrap'
import { BsImageFill, BsMicFill, BsMicMuteFill } from 'react-icons/bs'
import useToggle from '@/hooks/useToggle'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { useNotificationContext } from '@/context/useNotificationContext'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import type { SocialPostType } from '@/types/data'
import { formatDateToDDMMYYYY } from '@/utils/date'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { API_URL, UPLOAD_URL } from '@/utils/env'

type Props = {
  onPostCreated?: (post: SocialPostType) => void
}

const CreatePostCard = ({ onPostCreated }: Props) => {
  const [newPost, setNewPost] = useState('')
  const { user } = useAuthContext()
  const { isTrue: isOpenPhoto, toggle: togglePhotoModel } = useToggle()
  const { showNotification } = useNotificationContext()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const authFetch = useAuthFetch()

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
  const [activeLanguage, setActiveLanguage] = useState<'en-US' | 'he-IL' | null>(null)

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return

    try {
      // שלב 1: יצירת הפוסט ללא תמונה
      const payload = {
        postId: 0,
        userId: user?.userId,
        content: newPost,
        createdAt: formatDateToDDMMYYYY(new Date()),
        similarityScore: 0,
        vector: '',
        updatedAt: formatDateToDDMMYYYY(new Date()),
        img: '', // נעדכן בשלב 3
      }

      const created = await authFetch(`${API_URL}/Post/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const newPostId = created?.postId
      if (!newPostId) throw new Error('Post creation failed: no ID returned.')

      let imgPath = UPLOAD_URL

      // שלב 2: המתנה קצרה כדי לוודא שהפוסט נשמר לפני ניסיון לעדכן אותו
      await new Promise((resolve) => setTimeout(resolve, 150))

      // שלב 3: העלאת תמונה
      if (selectedImage) {
        const formData = new FormData()
        formData.append('files', selectedImage)

        const uploadResponse = await authFetch(`${API_URL}/Upload?type=post&id=${newPostId}`, {
          method: 'POST',
          body: formData,
        })

        if (Array.isArray(uploadResponse) && uploadResponse.length > 0) {
          imgPath += uploadResponse[0]

          // שלב 4: עדכון התמונה במסד — עטוף ב־try כדי לא להפיל את הכול
          try {
            await authFetch(`${API_URL}/Post/${newPostId}/image`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(imgPath),
            })
          } catch (imgErr) {
            console.warn('⚠️ Image update failed, but continuing:', imgErr)
          }
        } else {
          throw new Error('No image path returned from server.')
        }
      }

      // שלב 5: בניית אובייקט פוסט סופי
      const fullPostObj: SocialPostType = {
        ...payload,
        postId: newPostId,
        img: imgPath,
        fullName: `${user?.firstName} ${user?.lastName}`,
        userProfilePic: user?.profilePic || '',
        userExperienceLevel: user?.experienceLevel || '',
        commentsCount: 0,
        likesCount: 0,
        hasLiked: false,
      }

      // שלב 6: איפוס והודעה
      setNewPost('')
      setSelectedImage(null)
      setPreviewUrl(null)
      resetTranscript()
      setActiveLanguage(null)

      onPostCreated?.(fullPostObj)
      showNotification({ message: 'Post created successfully!', variant: 'success' })
    } catch (err) {
      console.error('❌ Post creation failed:', err)
      showNotification({ message: err instanceof Error ? err.message : String(err), variant: 'danger' })
    }
  }

  const handleMicToggle = (lang: 'en-US' | 'he-IL') => {
    if (listening && activeLanguage === lang) {
      SpeechRecognition.stopListening()
      setNewPost((prev) => (prev + ' ' + transcript).trim())
      resetTranscript()
      setActiveLanguage(null)
    } else {
      SpeechRecognition.stopListening()
      resetTranscript()
      setActiveLanguage(lang)
      SpeechRecognition.startListening({ continuous: true, language: lang })
    }
  }

  if (!browserSupportsSpeechRecognition) return <div>Your browser does not support speech recognition.</div>

  return (
    <Card className="card-body">
      <div className="d-flex mb-3">
        <div className="avatar avatar-xs me-2">
          <img className="avatar-img rounded-circle" src={user?.profilePic || placeHolder} alt="avatar" />
        </div>

        <form
          className="w-100"
          onSubmit={(e) => {
            e.preventDefault()
            handlePostSubmit()
          }}>
          <textarea
            className="form-control pe-4 border-0"
            rows={2}
            placeholder="Share your thoughts..."
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          {previewUrl && (
            <div className="mb-2">
              <img
                src={previewUrl}
                alt="Preview"
                className="rounded-circle"
                style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid #ccc' }}
              />
            </div>
          )}

          <ul className="nav nav-pills nav-stack small fw-normal">
            <li className="nav-item">
              <a className="nav-link bg-light py-1 px-2 mb-0" onClick={togglePhotoModel}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="upload-image"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    setSelectedImage(file)
                    setPreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                />
                <label htmlFor="upload-image" className="nav-link bg-light py-1 px-2 mb-0" style={{ cursor: 'pointer' }}>
                  <BsImageFill size={20} className="text-success pe-2" /> Photo
                </label>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link bg-light py-1 px-2 mb-0" onClick={() => handleMicToggle('en-US')}>
                {listening && activeLanguage === 'en-US' ? (
                  <>
                    <BsMicMuteFill size={20} className="text-danger pe-2" /> Stop Recording
                  </>
                ) : (
                  <>
                    <BsMicFill size={20} className="text-primary pe-2" /> Speak English
                  </>
                )}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link bg-light py-1 px-2 mb-0" onClick={() => handleMicToggle('he-IL')}>
                {listening && activeLanguage === 'he-IL' ? (
                  <>
                    <BsMicMuteFill size={20} className="text-danger pe-2" /> Stop Recording
                  </>
                ) : (
                  <>
                    <BsMicFill size={20} className="text-warning pe-2" /> Speak Hebrew
                  </>
                )}
              </a>
            </li>
            <div className="nav-item ms-lg-auto">
              <button type="submit" className="btn btn-success-soft">
                Post
              </button>
            </div>
          </ul>
        </form>
      </div>
    </Card>
  )
}

export default CreatePostCard
