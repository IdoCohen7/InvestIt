import { useEffect, useState } from 'react'
import { timeSince } from '@/utils/date'
import clsx from 'clsx'
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'
import { BsCheckLg, BsThreeDots } from 'react-icons/bs'
import PageMetaData from '@/components/PageMetaData'
import { useAuthContext } from '@/context/useAuthContext'
import { Link } from 'react-router-dom'
import { Notification } from '@/types/data'
import { API_URL } from '@/utils/env'

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [justReadIds, setJustReadIds] = useState<number[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const pageSize = 10
  const { user } = useAuthContext()

  const fetchNotifications = (pageToLoad: number) => {
    fetch(`${API_URL}/Notification?userId=${user?.userId}&page=${pageToLoad}&pageSize=${pageSize}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((newData: Notification[]) => {
        setNotifications((prev) => [...prev, ...newData])
        setHasMore(newData.length === pageSize)
      })
      .catch(console.error)
  }

  useEffect(() => {
    if (user?.userId) {
      fetchNotifications(1)

      // הפעלת סימון כהתראות נקראו
      fetch(`${API_URL}/Notification?userId=${user.userId}`, {
        method: 'PUT',
      })
        .then(() => {
          const unread = notifications.filter((n) => !n.isRead)
          if (unread.length === 0) return // טיפ: אין צורך באנימציה אם כולן כבר נקראו

          const idsToAnimate = unread.map((n) => n.notificationId)
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
          setJustReadIds(idsToAnimate)

          setTimeout(() => setJustReadIds([]), 1500)
        })
        .catch(console.error)
    }
  }, [user])

  const handleLoadMore = () => {
    const nextPage = page + 1
    fetchNotifications(nextPage)
    setPage(nextPage)
  }

  const renderNotificationText = (type: Notification['type']) => {
    switch (type) {
      case 'comment':
        return 'commented on your post.'
      case 'like':
        return 'liked your post.'
      case 'follow':
        return 'started following you.'
      default:
        return 'sent you a notification.'
    }
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()

  return (
    <>
      <PageMetaData title="Notifications" />
      <main>
        <Container>
          <Row className="g-4">
            <Col lg={8} className="mx-auto">
              <Card>
                <CardHeader className="py-3 border-0 d-flex align-items-center justify-content-between">
                  <h1 className="h5 mb-0">Notifications</h1>
                  <Dropdown>
                    <DropdownToggle
                      as="a"
                      className="text-secondary content-none btn btn-secondary-soft-hover py-1 px-2"
                      id="cardNotiAction"
                      data-bs-toggle="dropdown"
                      aria-expanded="false">
                      <BsThreeDots />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardNotiAction">
                      <li>
                        <DropdownItem>
                          <BsCheckLg size={22} className="fa-fw pe-2" />
                          Mark all read
                        </DropdownItem>
                      </li>
                    </DropdownMenu>
                  </Dropdown>
                </CardHeader>
                <CardBody className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-muted mb-1">You're all caught up!</p>
                      <p className="small text-muted">No new notifications at the moment.</p>
                    </div>
                  ) : (
                    <ul className="list-unstyled">
                      {notifications.map((notification) => (
                        <li key={notification.notificationId}>
                          <div
                            className={clsx('rounded d-sm-flex border-0 mb-1 p-3 position-relative transition-notification', {
                              'badge-unread': !notification.isRead,
                              'just-read': justReadIds.includes(notification.notificationId),
                            })}>
                            <div className="avatar text-center">
                              {notification.actorProfilePic ? (
                                <img
                                  src={notification.actorProfilePic}
                                  alt={notification.actorName}
                                  className="avatar-img rounded-circle"
                                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="avatar-img rounded-circle bg-primary">
                                  <span className="text-white position-absolute top-50 start-50 translate-middle fw-bold">
                                    {getInitials(notification.actorName)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mx-sm-3 my-2 my-sm-0">
                              <p className="small mb-1">
                                <Link
                                  to={`/profile/feed/${notification.actorId}`}
                                  className="d-flex align-items-center text-decoration-none text-semibold">
                                  <b>{notification.actorName}</b>
                                </Link>{' '}
                                {renderNotificationText(notification.type)}
                              </p>
                            </div>
                            <div className="d-flex ms-auto">
                              <p className="small me-5 text-nowrap">{timeSince(new Date(notification.createdAt))}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
                {hasMore && (
                  <CardFooter className="border-0 py-3 text-center position-relative d-grid pt-0">
                    <Button onClick={handleLoadMore}>Load more</Button>
                  </CardFooter>
                )}
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}

export default Notifications
