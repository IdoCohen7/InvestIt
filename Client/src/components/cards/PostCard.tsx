// PostCard.tsx
import { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import {
  BsBookmark,
  BsChatFill,
  BsFlag,
  BsHandThumbsUpFill,
  BsPersonX,
  BsSendFill,
  BsSlashCircle,
  BsThreeDots,
  BsXCircle,
  BsTrashFill,
  BsPencilSquare,
} from 'react-icons/bs'
import LoadContentButton from '../LoadContentButton'
import CommentItem from './components/CommentItem'
import type { CommentType } from '@/types/data'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { Link } from 'react-router-dom'
import { API_URL } from '@/utils/env'

interface PostCardProps {
  postId: number
  userId: number
  content: string
  createdAt: string
  updatedAt?: string | null
  vector?: string | null
  likesCount: number
  commentsCount: number
  hasLiked: boolean // ← ✅ חדש
  fullName: string
  userProfilePic: string
  userExperienceLevel: string
  onDelete?: (postId: number) => void
}

const ActionMenu = ({ name }: { name?: string }) => (
  <Dropdown>
    <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
      <BsThreeDots />
    </DropdownToggle>
    <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
      <li>
        <DropdownItem>
          <BsBookmark className="pe-2" /> Save post
        </DropdownItem>
      </li>
      <li>
        <DropdownItem>
          <BsPersonX className="pe-2" /> Unfollow {name}
        </DropdownItem>
      </li>
      <li>
        <DropdownItem>
          <BsXCircle className="pe-2" /> Hide post
        </DropdownItem>
      </li>
      <li>
        <DropdownItem>
          <BsSlashCircle className="pe-2" /> Block
        </DropdownItem>
      </li>
      <li>
        <DropdownDivider />
      </li>
      <li>
        <DropdownItem>
          <BsFlag className="pe-2" /> Report post
        </DropdownItem>
      </li>
    </DropdownMenu>
  </Dropdown>
)

const PostCard = ({
  postId,
  userId,
  createdAt,
  updatedAt,
  likesCount,
  content,
  commentsCount,
  userExperienceLevel,
  userProfilePic,
  fullName,
  hasLiked: hasLikedProp, // ← ✅ שינוי כאן
  onDelete,
}: PostCardProps) => {
  const { user } = useAuthContext()
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [comments, setComments] = useState<CommentType[]>([])
  const [newComment, setNewComment] = useState('')
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount)
  const [localLikesCount, setLocalLikesCount] = useState(likesCount)
  const [hasLiked, setHasLiked] = useState(hasLikedProp)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [editedAt, setEditedAt] = useState<string | null>(updatedAt ?? null)
  const [commentPage, setCommentPage] = useState(1)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const PAGE_SIZE = 3

  const fetchComments = async (page = 1) => {
    try {
      const res = await fetch(`${API_URL}/Comment?postId=${postId}&page=${page}&pageSize=${PAGE_SIZE}`)

      if (res.status === 204 || res.status === 404) {
        if (page === 1) setComments([])
        setHasMoreComments(false)
        return
      }

      const data = await res.json()
      const formatted: CommentType[] = data.map((c: any) => ({
        commentId: c.commentId,
        postId: c.postId,
        userId: c.userId,
        comment: c.content,
        createdAt: c.createdAt,
        firstName: c.firstName,
        lastName: c.lastName,
        profilePic: c.profilePic,
      }))

      setComments((prev) => [...prev, ...formatted])
      setHasMoreComments(formatted.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to fetch comments:', err)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const commentToSend = {
        commentId: 0,
        postId,
        userId: user?.userId,
        content: newComment,
        createdAt: new Date().toISOString(),
      }

      const res = await fetch(`${API_URL}/Comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentToSend),
      })

      if (!res.ok) throw new Error('Failed to post comment')

      setNewComment('')
      setCommentPage(1)
      setComments([]) // איפוס רשימת תגובות קיימת
      await fetchComments(1) // ריענון עם תגובות עדכניות מהשרת
      setLocalCommentsCount((prev) => prev + 1)
    } catch (err) {
      console.error('Error posting comment:', err)
    }
  }

  const handleDeleteComment = (commentId: number) => {
    setComments((prev) => prev.filter((c) => c.commentId !== commentId))
    setLocalCommentsCount((prev) => Math.max(prev - 1, 0))
  }

  const handleToggleComments = async () => {
    if (!commentsVisible) {
      setCommentPage(1)
      setComments([])
      await fetchComments(1)
    }
    setCommentsVisible(!commentsVisible)
  }

  const handleLoadMoreComments = async () => {
    const nextPage = commentPage + 1
    await fetchComments(nextPage)
    setCommentPage(nextPage)
  }

  const handleDeletePost = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await fetch(`${API_URL}/Post/delete?postId=${postId}&userId=${user?.userId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete post')
        onDelete?.(postId)
      } catch (err) {
        console.error('Error deleting post:', err)
      }
    }
  }

  const handleLike = async () => {
    try {
      const res = await fetch(`${API_URL}/Post/${postId}/like?userId=${user?.userId}`, {
        method: 'POST',
      })
      const data = await res.json()
      if (data.status === 'Liked') {
        setLocalLikesCount((prev) => prev + 1)
        setHasLiked(true)
      } else if (data.status === 'Unliked') {
        setLocalLikesCount((prev) => Math.max(prev - 1, 0))
        setHasLiked(false)
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleEditPost = async () => {
    if (!editContent.trim()) return
    try {
      const res = await fetch(`${API_URL}/Post/edit?postId=${postId}&userId=${user?.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editContent),
      })

      if (!res.ok) throw new Error('Failed to edit post')

      // אין צורך ב-res.json(), פשוט נעדכן מקומית
      setIsEditing(false)
      setEditedAt(new Date().toISOString())
    } catch (err) {
      console.error('Error editing post:', err)
    }
  }

  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <div className="d-flex justify-content-between align-items-center">
          {/* פרטי המשתמש */}
          <Link to={`/profile/feed/${userId}`} className="d-flex align-items-center text-decoration-none text-reset">
            <div className="avatar avatar-story me-2">
              <img
                className="avatar-img rounded-circle"
                src={userProfilePic || placeHolder}
                alt={fullName}
                style={{
                  transition: '0.2s',
                  border: '2px solid transparent',
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = '#0d6efd')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'transparent')}
              />
            </div>
            <div>
              <div className="nav nav-divider">
                <h6 className="nav-item card-title mb-0 text-body">{fullName}</h6>
                <span className="nav-item small">{createdAt}</span>
              </div>
              <p className="mb-0 small text-muted">{userExperienceLevel}</p>
            </div>
          </Link>

          {/* כפתורי עריכה ומחיקה */}
          {user?.userId === userId && (
            <div className="d-flex align-items-center gap-2">
              <button onClick={() => setIsEditing((prev) => !prev)} className="btn btn-sm btn-primary-soft" title="Edit post">
                <BsPencilSquare />
              </button>
              <button onClick={handleDeletePost} className="btn btn-sm btn-danger-soft" title="Delete post">
                <BsTrashFill />
              </button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {isEditing ? (
          <>
            <textarea className="form-control mb-2" rows={3} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
            <button className="btn btn-success btn-sm" onClick={handleEditPost}>
              Save
            </button>
          </>
        ) : (
          <>
            <p>{editContent}</p>
            {editedAt && !isEditing && !isNaN(Date.parse(editedAt)) && (
              <p className="text-muted small mb-1">
                Edited on{' '}
                {new Date(editedAt).toLocaleString(undefined, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </>
        )}

        <ul className="nav nav-stack py-3 small">
          <li className="nav-item">
            <span className="nav-link icons-center" role="button" onClick={handleLike}>
              <BsHandThumbsUpFill className="pe-1" />
              {hasLiked ? 'Unlike' : 'Like'} ({localLikesCount})
            </span>
          </li>
          <li className="nav-item">
            <span role="button" className="nav-link icons-center" onClick={handleToggleComments}>
              <BsChatFill className="pe-1" /> Comments ({localCommentsCount})
            </span>
          </li>
        </ul>

        {commentsVisible && (
          <>
            <div className="d-flex mb-3">
              <div className="avatar avatar-xs me-2">
                <img className="avatar-img rounded-circle" src={user?.profilePic || placeHolder} alt="avatar" />
              </div>
              <form
                className="nav nav-item w-100 position-relative"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleAddComment()
                }}>
                <textarea
                  className="form-control pe-5 bg-light"
                  rows={1}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
                <button className="nav-link bg-transparent px-3 position-absolute top-50 end-0 translate-middle-y border-0" type="submit">
                  <BsSendFill />
                </button>
              </form>
            </div>

            <ul className="comment-wrap list-unstyled">
              {comments.map((comment) => (
                <CommentItem key={comment.commentId} {...comment} onDelete={() => handleDeleteComment(comment.commentId)} />
              ))}
            </ul>
          </>
        )}
      </CardBody>

      <CardFooter className="border-0 pt-0">
        {commentsVisible && hasMoreComments && <LoadContentButton name="Load more comments" onClick={handleLoadMoreComments} />}
      </CardFooter>
    </Card>
  )
}

export default PostCard
