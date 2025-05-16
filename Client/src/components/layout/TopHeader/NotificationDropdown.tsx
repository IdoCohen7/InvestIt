import { useEffect, useState } from 'react'
import { timeSince } from '@/utils/date'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsBellFill, BsThreeDots, BsCheckLg } from 'react-icons/bs'
import { useAuthContext } from '@/context/useAuthContext'
import { Notification } from '@/types/data'
import { API_URL } from '@/utils/env'

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [justReadIds, setJustReadIds] = useState<number[]>([])
  const { user, removeSession } = useAuthContext()
  const navigate = useNavigate()

  const loadNotifications = async () => {
    if (!user?.userId || !user?.token) return

    try {
      const res = await fetch(`${API_URL}/Notification?userId=${user.userId}&page=1&pageSize=4`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      if (res.status === 401) {
        removeSession()
        navigate('/auth/sign-in')
        return
      }
      if (!res.ok) throw new Error('Failed to fetch notifications')
      const data = await res.json()
      setNotifications(data)
    } catch (err) {
      console.error(err)
    }

    try {
      const resCount = await fetch(`${API_URL}/Notification/notificationsTotal?userId=${user.userId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      if (resCount.status === 401) {
        removeSession()
        navigate('/auth/sign-in')
        return
      }
      if (!resCount.ok) throw new Error('Failed to fetch unread count')
      const count = await resCount.json()
      setUnreadCount(count)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [user?.userId, user?.token])

  const handleDropdownToggle = (isOpen: boolean) => {
    if (isOpen && user?.userId && unreadCount > 0 && user?.token) {
      fetch(`${API_URL}/Notification?userId=${user.userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
        .then(async (res) => {
          if (res.status === 401) {
            removeSession()
            navigate('/auth/sign-in')
            return
          }
          if (!res.ok) throw new Error('Failed to mark notifications as read')
          // נסה לקרוא JSON, ואם לא מצליח - החזר null
          try {
            return await res.json()
          } catch {
            return null
          }
        })
        .then(() => {
          setUnreadCount(0)

          const newlyReadIds = notifications.filter((n) => !n.isRead).map((n) => n.notificationId)

          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

          setJustReadIds(newlyReadIds)

          setTimeout(() => {
            setJustReadIds([])
          }, 1500)
        })
        .catch(console.error)
    }
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
    <Dropdown as="li" autoClose="outside" className="nav-item ms-2" drop="down" align="end" onToggle={handleDropdownToggle}>
      <DropdownToggle className="content-none nav-link bg-light icon-md btn btn-light p-0">
        {unreadCount > 0 && <span className="badge-notif animation-blink" />}
        <BsBellFill size={15} />
      </DropdownToggle>
      <DropdownMenu className="dropdown-animation dropdown-menu-end dropdown-menu-size-md p-0 shadow-lg border-0">
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h6 className="m-0">
              Notifications {unreadCount > 0 && <span className="badge bg-danger bg-opacity-10 text-danger ms-2">{unreadCount} new</span>}
            </h6>
            <Link className="small" to="/notifications">
              View all
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="list-group list-group-flush list-unstyled p-2">
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
                          className="avatar-img rounded-circle"
                          src={notification.actorProfilePic}
                          alt={notification.actorName}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
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
                        <Link to={`/profile/feed/${notification.actorId}`} className="text-decoration-none fw-semibold text-white">
                          {notification.actorName}
                        </Link>{' '}
                        {renderNotificationText(notification.type)}
                      </p>
                    </div>
                    <p className="small text-nowrap ms-auto">{timeSince(new Date(notification.createdAt))}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
          <CardFooter className="text-center">
            <Link to="/notifications">
              <Button variant="primary-soft" size="sm">
                See all notifications
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </DropdownMenu>
    </Dropdown>
  )
}

export default NotificationDropdown
