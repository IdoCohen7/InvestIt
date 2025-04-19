import { lazy, Suspense, useState } from 'react'
import CameraModal from '@/components/cameraModal'
import { useNavigate } from 'react-router-dom'
import GlightBox from '@/components/GlightBox'
import type { ChildrenType } from '@/types/component'
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
import {
  BsBookmark,
  BsBriefcase,
  BsCalendar2Plus,
  BsCalendarDate,
  BsEnvelope,
  BsFileEarmarkPdf,
  BsGear,
  BsGeoAlt,
  BsHeart,
  BsLock,
  BsPatchCheckFill,
  BsPencilFill,
  BsThreeDots,
} from 'react-icons/bs'

import placeHolder from '@/assets/images/avatar/placeholder.jpg'

import FallbackLoading from '@/components/FallbackLoading'
import Preloader from '@/components/Preloader'
import { useAuthContext } from '@/context/useAuthContext'

const TopHeader = lazy(() => import('@/components/layout/TopHeader'))

const ProfileLayout = ({ children }: ChildrenType) => {
  const { user, saveSession } = useAuthContext()
  const [showCamera, setShowCamera] = useState(false)
  const navigate = useNavigate()

  const handleImageUpload = async (relativePath: string) => {
    if (!user) return

    const fullPath = `https://localhost:7204/uploadedFiles/profilePics/${user.userId}.jpg`

    try {
      const res = await fetch(`https://localhost:7204/api/User/ProfilePic/${user.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPath),
      })

      if (!res.ok) throw new Error('Failed to update profile picture')

      // עדכון context
      const updatedUser = { ...user, profilePic: fullPath }
      saveSession(updatedUser, true)
      setShowCamera(false)
      window.location.reload()
    } catch (err) {
      console.error('Error updating profile picture:', err)
    }
  }

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
                    backgroundImage: `url("/images/Banner2.png")`,
                    backgroundPosition: 'top',
                    backgroundSize: '100% auto',
                    backgroundRepeat: 'no-repeat',
                    height: '150px'
                  }}
                />
                <CardBody className="py-0">
                  <div className="d-sm-flex align-items-start text-center text-sm-start">
                    <div>
                      <div className="avatar avatar-xxl mt-n5 mb-3" onClick={() => setShowCamera(true)} role="button">
                        <img
                          className="avatar-img rounded-circle border border-white border-3"
                          src={user ? user.profilePic || placeHolder : placeHolder}
                          alt="avatar"
                        />
                      </div>
                    </div>
                    <div className="ms-sm-4 mt-sm-3">
                      <h1 className="mb-0 h5">
                        {user ? user.firstName + ' ' + user.lastName : 'Guest'}
                        <BsPatchCheckFill className="text-success small" />
                      </h1>
                      <p>{user ? `${user.connections || 0} connections` : '0 connections'}</p>
                    </div>
                    <div className="d-flex mt-3 justify-content-center ms-sm-auto">
                      <Button 
                        variant="danger-soft" 
                        className="me-2" 
                        type="button"
                        onClick={() => navigate('/settings/account')}>
                        <BsPencilFill size={19} className="pe-1" /> Edit profile
                      </Button>
                      <Dropdown>
                        <DropdownToggle
                          as="a"
                          className="icon-md btn btn-light content-none"
                          type="button"
                          id="profileAction2"
                          data-bs-toggle="dropdown"
                          aria-expanded="false">
                          <span>
                            <BsThreeDots />
                          </span>
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
                    </div>
                  </div>
                  <div className="hstack gap-2 gap-xl-3 justify-content-center">
                    <div>
                      <h6 className="mb-0 small">{user ? user.experienceLevel || 'No Level' : 'No Level'}</h6>
                      <small className="text-muted fs-xs">Experience</small>
                    </div>
                    <div className="vr" />
                    <div>
                      <h6 className="mb-0 small">{user ? user.createdAt : 'No Date'}</h6>
                      <small className="text-muted fs-xs">Joined</small>
                    </div>
                    <div className="vr" />
                    <div>
                      <h6 className="mb-0 small">{user ? user.isActive ? 'Active' : 'Inactive' : 'N/A'}</h6>
                      <small className="text-muted fs-xs">Status</small>
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
                      <p>{user ? user.bio || 'No bio available' : 'No bio available'}</p>
                      <ul className="list-unstyled mt-3 mb-0">
                        <li className="mb-2">
                          <BsEnvelope size={18} className="fa-fw pe-1" /> Email: <strong>{user ? user.email : 'No email'}</strong>
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

      <CameraModal show={showCamera} onClose={() => setShowCamera(false)} onUploadSuccess={handleImageUpload} />
    </>
  )
}
export default ProfileLayout
