import { useState } from 'react'
import { Card } from 'react-bootstrap'
import { BsImageFill, BsMicFill, BsMicMuteFill } from 'react-icons/bs'
import useToggle from '@/hooks/useToggle'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { useNotificationContext } from '@/context/useNotificationContext'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { API_URL } from '@/utils/env'
import type { SocialPostType } from '@/types/data'
import { formatDateToDDMMYYYY } from '@/utils/date'
import { useAuthFetch } from '@/hooks/useAuthFetch'

type Props = {
  onPostCreated?: (post: SocialPostType) => void
}

const CreatePostCard = ({ onPostCreated }: Props) => {
  const [newPost, setNewPost] = useState('')
  const { user } = useAuthContext()
  const { isTrue: isOpenPhoto, toggle: togglePhotoModel } = useToggle()
  const { showNotification } = useNotificationContext()
  const authFetch = useAuthFetch()

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
  const [activeLanguage, setActiveLanguage] = useState<'en-US' | 'he-IL' | null>(null)

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return

    try {
      const payload = {
        postId: 0,
        userId: user?.userId,
        content: newPost,
        createdAt: formatDateToDDMMYYYY(new Date()),
        similarityScore: 0,
        vector: '',
        updatedAt: formatDateToDDMMYYYY(new Date()),
      }

      const created = await authFetch(`${API_URL}/Post/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const fullPostObj: SocialPostType = {
        ...payload,
        postId: created.postId,
        fullName: `${user?.firstName} ${user?.lastName}`,
        userProfilePic: user?.profilePic || '',
        userExperienceLevel: user?.experienceLevel || '',
        commentsCount: 0,
        likesCount: 0,
        hasLiked: false,
      }

      setNewPost('')
      resetTranscript()
      setActiveLanguage(null)

      if (onPostCreated) onPostCreated(fullPostObj)
      showNotification({ message: 'Post created successfully!', variant: 'success' })
    } catch (err) {
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
        </form>
      </div>

      <ul className="nav nav-pills nav-stack small fw-normal">
        <li className="nav-item">
          <a className="nav-link bg-light py-1 px-2 mb-0" onClick={togglePhotoModel}>
            <BsImageFill size={20} className="text-success pe-2" /> Photo
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
          <button type="button" className="btn btn-success-soft" onClick={handlePostSubmit}>
            Post
          </button>
        </div>
      </ul>
    </Card>
  )
}

export default CreatePostCard
