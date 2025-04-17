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
} from 'react-icons/bs'
import LoadContentButton from '../LoadContentButton'
import CommentItem from './components/CommentItem'
import { Link } from 'react-router-dom'
import avatar12 from '@/assets/images/avatar/12.jpg'
import type { CommentType } from '@/types/data'
import { useAuthContext } from '@/context/useAuthContext'

interface PostCardProps {
  postId: number
  userId: number
  content: string
  createdAt: string
  updatedAt?: string | null
  vector?: string | null
  likesCount: number
  commentsCount: number
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
  likesCount,
  content,
  commentsCount,
  userExperienceLevel,
  userProfilePic,
  fullName,
  onDelete,
}: PostCardProps) => {
  const [commentsVisible, setCommentsVisible] = useState(false)
  const [comments, setComments] = useState<CommentType[]>([])
  const { user } = useAuthContext()

  const handleToggleComments = async () => {
    if (!commentsVisible) {
      try {
        const res = await fetch(`https://localhost:7204/api/Comment?postId=${postId}`)
        const raw = await res.text()
        const data = raw ? JSON.parse(raw) : []
        const formatted: CommentType[] = data.map((c: any) => ({
          id: c.commentId,
          postId: c.postId,
          socialUserId: c.userId,
          comment: c.content,
          createdAt: c.createdAt,
          likesCount: 0,
          socialUser: {
            id: c.userId,
            name: `${c.firstName} ${c.lastName}`,
            avatar: c.profilePic,
            isStory: false,
          },
        }))
        setComments(formatted)
      } catch (err) {
        console.error('Failed to fetch comments:', err)
      }
    }
    setCommentsVisible(!commentsVisible)
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        const res = await fetch(`https://localhost:7204/api/Post/delete?postId=${postId}&userId=${user?.userId}`, {
          method: 'DELETE',
        })
        if (!res.ok) throw new Error('Failed to delete post')
        if (onDelete) onDelete(postId)
      } catch (err) {
        console.error('Error deleting post:', err)
      }
    }
  }

  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar avatar-story me-2">
              {userProfilePic && (
                <span role="button">
                  <img className="avatar-img rounded-circle" src={userProfilePic} alt={fullName} />
                </span>
              )}
            </div>
            <div>
              <div className="nav nav-divider">
                <h6 className="nav-item card-title mb-0">
                  <span role="button">{fullName}</span>
                </h6>
                <span className="nav-item small">{createdAt}</span>
              </div>
              <p className="mb-0 small">{userExperienceLevel}</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {user?.userId === userId && (
              <button onClick={handleDelete} className="btn btn-sm btn-danger-soft" title="Delete post">
                <BsTrashFill />
              </button>
            )}
            <ActionMenu name={fullName} />
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {content && <p>{content}</p>}
        <ul className="nav nav-stack py-3 small">
          <li className="nav-item">
            <Link className="nav-link active icons-center" to="">
              <BsHandThumbsUpFill className="pe-1" /> Liked ({likesCount})
            </Link>
          </li>
          <li className="nav-item">
            <span role="button" className="nav-link icons-center" onClick={handleToggleComments}>
              <BsChatFill className="pe-1" /> Comments ({commentsCount})
            </span>
          </li>
        </ul>

        {commentsVisible && (
          <>
            <div className="d-flex mb-3">
              <div className="avatar avatar-xs me-2">
                <span role="button">
                  <img className="avatar-img rounded-circle" src={avatar12} alt="avatar12" />
                </span>
              </div>
              <form className="nav nav-item w-100 position-relative">
                <textarea className="form-control pe-5 bg-light" rows={1} placeholder="Add a comment..." defaultValue={''} />
                <button className="nav-link bg-transparent px-3 position-absolute top-50 end-0 translate-middle-y border-0" type="button">
                  <BsSendFill />
                </button>
              </form>
            </div>
            <ul className="comment-wrap list-unstyled">
              {comments.map((comment) => (
                <CommentItem key={comment.commentId} {...comment} />
              ))}
            </ul>
          </>
        )}
      </CardBody>

      <CardFooter className="border-0 pt-0">{commentsVisible && <LoadContentButton name="Load more comments" />}</CardFooter>
    </Card>
  )
}

export default PostCard
