import { useState } from 'react'
import { Card } from 'react-bootstrap'
import { BsImageFill } from 'react-icons/bs'
import useToggle from '@/hooks/useToggle'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'

const CreatePostCard = () => {
  const [newPost, setNewPost] = useState('')
  const { user } = useAuthContext()
  const { isTrue: isOpenPhoto, toggle: togglePhotoModel } = useToggle()

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return

    try {
      const res = await fetch('https://localhost:7204/api/Post/add', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: 0,
          userId: user?.userId,
          content: newPost,
          createdAt: new Date().toISOString(),
          similarityScore: 0,
          vector: '',
          updatedAt: new Date().toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Failed to create post')

      setNewPost('')
      window.location.reload()
    } catch (err) {
      console.error('Error creating post:', err)
    }
  }

  return (
    <Card className="card-body">
      <div className="d-flex mb-3">
        <div className="avatar avatar-xs me-2">
          <span role="button">
            <img className="avatar-img rounded-circle" src={user?.profilePic || placeHolder} alt="avatar" />
          </span>
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
