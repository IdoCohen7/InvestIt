import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'react-bootstrap'
import { BsBookmark, BsEnvelope, BsFileEarmarkPdf, BsGear, BsLock, BsPatchCheckFill, BsPencilFill, BsThreeDots } from 'react-icons/bs'
import { API_URL, UPLOAD_URL } from '@/utils/env'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import FallbackLoading from '@/components/FallbackLoading'
import Preloader from '@/components/Preloader'
import CameraModal from '@/components/cameraModal'
import { useAuthContext } from '@/context/useAuthContext'
import { useAuthFetch } from '@/hooks/useAuthFetch' // <-- הוספת ייבוא useAuthFetch
import type { ChildrenType } from '@/types/component'
import type { UserPage } from '@/types/data'
import Banner from '@/assets/images/bg/banner2.png'

const TopHeader = lazy(() => import('@/components/layout/TopHeader'))

interface ProfileLayoutProps extends ChildrenType {
  userId: string
}

const ProfileLayout = ({ userId, children }: ProfileLayoutProps) => {
  const { user, saveSession } = useAuthContext()
  const authFetch = useAuthFetch() // <-- שימוש ב-useAuthFetch
  const [profileUser, setProfileUser] = useState<UserPage | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const navigate = useNavigate()
  const [notFound, setNotFound] = useState(false)
  const [isFollowed, setIsFollowed] = useState<boolean | null>(null)
  const [followersCount, setFollowersCount] = useState<number | null>(null)

  const fetchProfileUser = async () => {
    if (!user?.token) return

    try {
      const data = await authFetch(`${API_URL}/User/${userId}?viewerId=${user?.userId}`)
      setProfileUser(data)
      setIsFollowed(data.isFollowed)
      setFollowersCount(data.followersCount)
    } catch (err) {
      console.error('Error fetching profile user:', err)
      setNotFound(true)
    }
  }

  const handleImageUpload = async (relativePath: string) => {
    if (!profileUser || !user?.token) return

    const fullPath = `${UPLOAD_URL}/profilePics/${profileUser.userId}.jpg`

    try {
      await authFetch(`${API_URL}/User/ProfilePic/${profileUser.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPath),
      })

      // שמור את הטוקן כדי שלא יימחק
      const updatedUser = { ...profileUser, profilePic: fullPath, token: user.token }

      setProfileUser(updatedUser)

      if (user?.userId === profileUser.userId) {
        saveSession(updatedUser, true) // חשוב לשמור גם את הטוקן
      }
      setShowCamera(false)
      window.location.reload()
    } catch (err) {
      console.error('Error updating profile picture:', err)
    }
  }

  const handleFollowToggle = async () => {
    if (!user || !profileUser || isFollowed === null || followersCount === null) return

    try {
      await authFetch(`${API_URL}/User/Follow?followedId=${profileUser.userId}&followerId=${user.userId}`, {
        method: 'POST',
      })

      const newIsFollowed = !isFollowed
      const newFollowers = newIsFollowed ? followersCount + 1 : Math.max(followersCount - 1, 0)

      setIsFollowed(newIsFollowed)
      setFollowersCount(newFollowers)

      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              isFollowed: newIsFollowed,
              followersCount: newFollowers,
            }
          : prev,
      )
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  useEffect(() => {
    if (userId && user?.userId && user?.token) {
      fetchProfileUser()
    }
  }, [userId, user?.userId, user?.token])

  if (notFound) navigate('/not-found')
  if (!profileUser || isFollowed === null || followersCount === null) return <p className="text-center mt-5">Loading profile...</p>

  const isOwner = profileUser.userId === user?.userId

  return (
    <>
      <Suspense fallback={<Preloader />}>
        <TopHeader />
      </Suspense>

      <main>
        <Container>
          <Row className="g-4">
            <Col lg={8} className="vstack gap-4">
              <Card>
                <div
                  className="h-200px rounded-top"
                  style={{
                    backgroundImage: `url(${Banner})`,
                    backgroundPosition: 'top',
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'no-repeat',
                    height: '150px',
                  }}
                />
                <CardBody className="py-0">
                  <div className="d-sm-flex align-items-center text-center text-sm-start justify-content-between flex-wrap gap-3">
                    <div
                      className="avatar avatar-xxl mt-n5 mb-3 position-relative"
                      onClick={() => isOwner && setShowCamera(true)}
                      role={isOwner ? 'button' : undefined}
                      style={{ cursor: isOwner ? 'pointer' : 'default' }}>
                      <img
                        className="avatar-img rounded-circle border border-white border-3"
                        src={profileUser.profilePic || placeHolder}
                        alt="avatar"
                      />

                      {isOwner && <div className="avatar-overlay"></div>}
                    </div>

                    <div className="flex-grow-1 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                      <div className="text-sm-start text-center">
                        <h1 className="mb-0 h5 d-flex align-items-center justify-content-center justify-content-sm-start">
                          {profileUser.firstName} {profileUser.lastName}
                          <BsPatchCheckFill className="text-success small ms-2" />
                        </h1>
                      </div>

                      <div className="hstack gap-4 justify-content-center">
                        <div>
                          <h6 className="mb-0">{profileUser.postsCount}</h6>
                          <small className="text-muted">Post</small>
                        </div>
                        <div className="vr" />
                        <div>
                          <h6 className="mb-0">{followersCount}</h6>
                          <small className="text-muted">Followers</small>
                        </div>
                        <div className="vr" />
                        <div>
                          <h6 className="mb-0">{profileUser.followingCount}</h6>
                          <small className="text-muted">Following</small>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex mt-3 justify-content-center ms-sm-auto gap-2">
                      {isOwner ? (
                        <>
                          <Button variant="danger-soft" onClick={() => navigate('/settings/account')}>
                            <BsPencilFill size={19} className="pe-1" /> Edit profile
                          </Button>
                          <Dropdown>
                            <DropdownToggle as="a" className="icon-md btn btn-light content-none" id="profileAction2">
                              <BsThreeDots />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-end" aria-labelledby="profileAction2">
                              <li>
                                <DropdownItem>
                                  <BsBookmark size={22} className="fa-fw pe-2" /> Share profile in a message
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>
                                  <BsFileEarmarkPdf size={22} className="fa-fw pe-2" /> Save your profile to PDF
                                </DropdownItem>
                              </li>
                              <li>
                                <DropdownItem>
                                  <BsLock size={22} className="fa-fw pe-2" /> Lock profile
                                </DropdownItem>
                              </li>
                              <li>
                                <hr className="dropdown-divider" />
                              </li>
                              <li>
                                <DropdownItem>
                                  <BsGear size={22} className="fa-fw pe-2" /> Profile settings
                                </DropdownItem>
                              </li>
                            </DropdownMenu>
                          </Dropdown>
                        </>
                      ) : (
                        <Button variant={isFollowed ? 'outline-primary' : 'primary'} onClick={handleFollowToggle} className="px-4">
                          {isFollowed ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
            </Col>

            <Col lg={4}>
              <Row className="g-4">
                <Col md={6} lg={12}>
                  <Card>
                    <CardHeader className="border-0 pb-0">
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardBody className="position-relative pt-0">
                      <p>{profileUser.bio || 'No bio available'}</p>
                      <ul className="list-unstyled mt-3 mb-0">
                        <li className="mb-2">
                          <BsEnvelope size={18} className="fa-fw pe-1" /> Email: <strong>{profileUser.email}</strong>
                        </li>
                      </ul>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </main>

      {isOwner && <CameraModal show={showCamera} onClose={() => setShowCamera(false)} onUploadSuccess={handleImageUpload} />}
    </>
  )
}

export default ProfileLayout
