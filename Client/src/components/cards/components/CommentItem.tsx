import LoadContentButton from '@/components/LoadContentButton'
import type { CommentType } from '@/types/data'
import { timeSince } from '@/utils/date'
import clsx from 'clsx'

import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'

const CommentItem = ({
  comment,
  children,
  createdAt,
  image,
  ...rest
}: CommentType & {
  firstName?: string
  lastName?: string
  profilePic?: string
}) => {
  // אם לא מגיע socialUser, נבנה אותו מדינמית מנתוני הפרופיל
  const socialUser = rest.socialUser ?? {
    name: `${rest.firstName ?? ''} ${rest.lastName ?? ''}`.trim(),
    avatar: rest.profilePic ?? '',
    isStory: false,
  }

  return (
    <li className="comment-item">
      {socialUser && (
        <>
          <div className="d-flex position-relative">
            <div className={clsx('avatar avatar-xs', { 'avatar-story': socialUser.isStory })}>
              <span role="button">
                <img className="avatar-img rounded-circle" src={socialUser.avatar} alt={socialUser.name + '-avatar'} />
              </span>
            </div>
            <div className="ms-2">
              <div className="bg-light rounded-start-top-0 p-3 rounded">
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">
                    <Link to="">{socialUser.name}</Link>
                  </h6>
                  <small className="ms-2">{timeSince(createdAt)}</small>
                </div>
                <p className="small mb-0">{comment}</p>
                {image && (
                  <Card className="p-2 border border-2 rounded mt-2 shadow-none">
                    <img width={172} height={277} src={image} alt="" />
                  </Card>
                )}
              </div>
              <ul className="nav nav-divider py-2 small"></ul>
            </div>
          </div>

          <ul className="comment-item-nested list-unstyled">
            {children?.map((childComment) => <CommentItem key={childComment.id} {...childComment} />)}
          </ul>

          {children?.length === 2 && <LoadContentButton name="Load more replies" className="mb-3 ms-5" />}
        </>
      )}
    </li>
  )
}

export default CommentItem
