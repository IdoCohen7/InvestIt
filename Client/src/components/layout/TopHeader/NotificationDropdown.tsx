import { useEffect, useState } from 'react'
import { timeSince } from '@/utils/date'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { Button, Card, CardBody, CardFooter, CardHeader, Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsBellFill } from 'react-icons/bs'
import { useAuthContext } from '@/context/useAuthContext'
import { Notification } from '@/types/data'
import { API_URL } from '@/utils/env'

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [justReadIds, setJustReadIds] = useState<number[]>([])
  const { user } = useAuthContext()

  const loadNotifications = () => {
    if (!user?.userId) return

    fetch(`${API_URL}/Notification?userId=${user.userId}&page=1&pageSize=4`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch notifications')
        return res.json()
      })
      .then(setNotifications)
      .catch(console.error)

    fetch(`${API_URL}/Notification/notificationsTotal?userId=${user.userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch unread count')
        return res.json()
      })
      .then(setUnreadCount)
      .catch(console.error)
  }

  useEffect(() => {
    loadNotifications()
  }, [user])

  const handleDropdownToggle = (isOpen: boolean) => {
    if (isOpen && user?.userId && unreadCount > 0) {
      fetch(`${API_URL}/Notification?userId=${user.userId}`, {
        method: 'PUT',
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
