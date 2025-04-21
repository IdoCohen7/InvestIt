// CommentItem.tsx
import LoadContentButton from '@/components/LoadContentButton'
import type { CommentType } from '@/types/data'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { BsTrashFill } from 'react-icons/bs'
import { useAuthContext } from '@/context/useAuthContext'
import { API_URL } from '@/utils/env'

const CommentItem = ({
  commentId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  postId,
  userId,
  comment,
  createdAt,
  profilePic,
  firstName,
  lastName,
  image,
  children,
  onDelete,
}: CommentType & { image?: string; children?: CommentType[]; onDelete?: () => void }) => {
  const name = firstName + ' ' + lastName
  const avatar = profilePic || placeHolder
  const { user } = useAuthContext()

  const handleDeleteComment = async () => {
    if (!user || user.userId !== userId) return
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const res = await fetch(`${API_URL}/Comment/${commentId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete comment')

      if (onDelete) onDelete()
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  return (
    <li className="comment-item" key={commentId}>
      <div className="d-flex position-relative">
        <div className={clsx('avatar avatar-xs')}>
          <span role="button">
            <img className="avatar-img rounded-circle" src={avatar} alt={`${name}-avatar`} />
          </span>
        </div>
        <div className="ms-2 w-100">
          <div className="bg-light rounded-start-top-0 p-3 rounded">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <Link to="">{name}</Link>
              </h6>
              <div className="d-flex align-items-center gap-2">
                <small className="text-muted">{createdAt}</small>
                {user?.userId === userId && (
                  <button
                    className="btn btn-sm p-0 text-danger bg-transparent border-0"
                    title="Delete comment"
                    onClick={handleDeleteComment}
                    style={{ fontSize: '0.85rem' }}>
                    <BsTrashFill />
                  </button>
                )}
              </div>
            </div>
            <p className="small mb-0 mt-2">{comment}</p>
            {image && (
              <Card className="p-2 border border-2 rounded mt-2 shadow-none">
                <img width={172} height={277} src={image} alt="" />
              </Card>
            )}
          </div>
        </div>
      </div>

      <ul className="comment-item-nested list-unstyled">{children?.map((child) => <CommentItem key={child.commentId} {...child} />)}</ul>

      {children?.length === 2 && <LoadContentButton name="Load more replies" className="mb-3 ms-5" />}
    </li>
  )
}

export default CommentItem
