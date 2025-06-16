import { lazy, Suspense, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Dropdown, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { BsEnvelope, BsPatchCheckFill, BsPencilFill, BsThreeDots, BsChatDots } from 'react-icons/bs'
import { API_URL, UPLOAD_URL } from '@/utils/env'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import FallbackLoading from '@/components/FallbackLoading'
import Preloader from '@/components/Preloader'
import CameraModal from '@/components/cameraModal'
import { useAuthContext } from '@/context/useAuthContext'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import type { ChildrenType } from '@/types/component'
import type { UserPage } from '@/types/data'
import Banner from '@/assets/images/bg/banner2.png'
import ExpertEditModal from '@/components/cards/EditExpertModal'

const TopHeader = lazy(() => import('@/components/layout/TopHeader'))

interface ProfileLayoutProps extends ChildrenType {
  userId: string
}

const ProfileLayout = ({ userId, children }: ProfileLayoutProps) => {
  const { user, saveSession } = useAuthContext()
  const authFetch = useAuthFetch()
  const [profileUser, setProfileUser] = useState<UserPage | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const navigate = useNavigate()
  const [notFound, setNotFound] = useState(false)
  const [isFollowed, setIsFollowed] = useState<boolean | null>(null)
  const [followersCount, setFollowersCount] = useState<number | null>(null)
  const [showExpertEdit, setShowExpertEdit] = useState(false)

  const isExpert = !!profileUser?.expertiseArea

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

      const updatedUser = { ...profileUser, profilePic: fullPath, token: user.token }
      setProfileUser(updatedUser)

      if (user?.userId === profileUser.userId) {
        saveSession(updatedUser, true)
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

  const handleMessageClick = async () => {
    if (!user || !profileUser) return

    try {
      await authFetch(`${API_URL}/Supabase/CreatePrivateChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdToChatWith: profileUser.userId }),
      })

      navigate('/messaging')
    } catch (err) {
      console.error('Error creating private chat:', err)
    }
  }

  const handleExpertChatClick = async () => {
    if (!user || !profileUser) return

    const confirmed = window.confirm(`Are you sure you want to pay $${profileUser.price} to chat with this expert?`)
    if (!confirmed) return

    await handleMessageClick()
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
                          {isExpert && <BsPatchCheckFill className="text-warning small ms-2" title="Verified Expert" />}
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
                          {isExpert && isOwner && (
                            <Button variant="warning" onClick={() => setShowExpertEdit(true)}>
                              Edit Expert Info
                            </Button>
                          )}

                          <Dropdown>
                            <DropdownToggle as="a" className="icon-md btn btn-light content-none" id="profileAction2">
                              <BsThreeDots />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-end" aria-labelledby="profileAction2"></DropdownMenu>
                          </Dropdown>
                        </>
                      ) : (
                        <>
                          <Button variant={isFollowed ? 'outline-primary' : 'primary'} onClick={handleFollowToggle} className="px-4">
                            {isFollowed ? 'Unfollow' : 'Follow'}
                          </Button>
                          {isExpert && profileUser.availableForChat ? (
                            <Button variant="success" className="px-4" onClick={handleExpertChatClick}>
                              <BsChatDots className="me-1" /> Chat with Expert
                            </Button>
                          ) : (
                            <Button variant="outline-primary" onClick={handleMessageClick} className="px-4">
                              Message
                            </Button>
                          )}
                        </>
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

                  {isExpert && (
                    <Card className="mt-4">
                      <CardHeader className="border-0 pb-0">
                        <CardTitle>Expert Details</CardTitle>
                      </CardHeader>
                      <CardBody className="pt-0">
                        <ul className="list-unstyled mb-0">
                          <li className="mb-2">
                            <strong>Expertise:</strong> {profileUser.expertiseArea}
                          </li>
                          <li className="mb-2">
                            <strong>Rate:</strong> ${profileUser.price}
                          </li>
                          <li className="mb-2">
                            <strong>Available for chat:</strong> {profileUser.availableForChat ? 'Yes' : 'No'}
                          </li>
                          <li className="mb-2">
                            <strong>Rating:</strong> ⭐ {profileUser.rating}
                          </li>
                        </ul>
                      </CardBody>
                    </Card>
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </main>

      {isOwner && <CameraModal show={showCamera} onClose={() => setShowCamera(false)} onUploadSuccess={handleImageUpload} />}
      {isOwner && isExpert && (
        <ExpertEditModal
          show={showExpertEdit}
          onClose={() => setShowExpertEdit(false)}
          currentExpertData={{
            expertiseArea: profileUser.expertiseArea || '',
            price: profileUser.price || 0,
            availableForChat: profileUser.availableForChat || false,
          }}
          onSave={async (updated) => {
            try {
              const payload = {
                userId: profileUser.userId,
                ...updated,
              }

              console.log('🚀 Sending to server:', payload) // ✅ כאן תראה מה נשלח בפועל

              await authFetch(`${API_URL}/Expert/update-expert`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              })

              setProfileUser((prev) =>
                prev
                  ? {
                      ...prev,
                      expertiseArea: updated.expertiseArea,
                      price: updated.price,
                      availableForChat: updated.availableForChat,
                    }
                  : prev,
              )
            } catch (err) {
              console.error('Failed to update expert info:', err)
            }
          }}
        />
      )}
    </>
  )
}

export default ProfileLayout
