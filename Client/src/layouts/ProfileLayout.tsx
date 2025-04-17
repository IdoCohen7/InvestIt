import { lazy, Suspense } from 'react'

const TopHeader = lazy(() => import('@/components/layout/TopHeader'))
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
import background5 from '@/assets/images/bg/05.jpg'

import album1 from '@/assets/images/albums/01.jpg'
import album2 from '@/assets/images/albums/02.jpg'
import album3 from '@/assets/images/albums/03.jpg'
import album4 from '@/assets/images/albums/04.jpg'
import album5 from '@/assets/images/albums/05.jpg'

import FallbackLoading from '@/components/FallbackLoading'
import Preloader from '@/components/Preloader'
import { useAuthContext } from '@/context/useAuthContext'

const Photos = () => {
  return (
    <Card>
      <CardHeader className="d-sm-flex justify-content-between border-0">
        <CardTitle>Photos</CardTitle>
        <Button variant="primary-soft" size="sm">
          See all photo
        </Button>
      </CardHeader>
      <CardBody className="position-relative pt-0">
        <Row className="g-2">
          <Col xs={6}>
            <GlightBox href={album1} data-gallery="image-popup">
              <img className="rounded img-fluid" src={album1} alt="album-image" />
            </GlightBox>
          </Col>
          <Col xs={6}>
            <GlightBox href={album2} data-gallery="image-popup">
              <img className="rounded img-fluid" src={album2} alt="album-image" />
            </GlightBox>
          </Col>
          <Col xs={4}>
            <GlightBox href={album3} data-gallery="image-popup">
              <img className="rounded img-fluid" src={album3} alt="album-image" />
            </GlightBox>
          </Col>
          <Col xs={4}>
            <GlightBox href={album4} data-gallery="image-popup">
              <img className="rounded img-fluid" src={album4} alt="album-image" />
            </GlightBox>
          </Col>
          <Col xs={4}>
            <GlightBox href={album5} data-gallery="image-popup">
              <img className="rounded img-fluid" src={album5} alt="album-image" />
            </GlightBox>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const ProfileLayout = ({ children }: ChildrenType) => {
  const { user } = useAuthContext()

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
                    backgroundImage: `url(${background5})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                <CardBody className="py-0">
                  <div className="d-sm-flex align-items-start text-center text-sm-start">
                    <div>
                      <div className="avatar avatar-xxl mt-n5 mb-3">
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
                      <p>250 connections</p>
                    </div>
                    <div className="d-flex mt-3 justify-content-center ms-sm-auto">
                      <Button variant="danger-soft" className="me-2" type="button">
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
                              <BsBookmark size={22} className="fa-fw pe-2" />
                              Share profile in a message
                            </DropdownItem>
                          </li>
                          <li>
                            <DropdownItem>
                              <BsFileEarmarkPdf size={22} className="fa-fw pe-2" />
                              Save your profile to PDF
                            </DropdownItem>
                          </li>
                          <li>
                            <DropdownItem>
                              <BsLock size={22} className="fa-fw pe-2" />
                              Lock profile
                            </DropdownItem>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>
                          <li>
                            <DropdownItem>
                              <BsGear size={22} className="fa-fw pe-2" />
                              Profile settings
                            </DropdownItem>
                          </li>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                  <ul className="list-inline mb-0 text-center text-sm-start mt-3 mt-sm-0">
                    <li className="list-inline-item">
                      <BsBriefcase className="me-1" /> {user ? user.experienceLevel || 'No Level' : 'No Level'}
                    </li>
                    <li className="list-inline-item">
                      <BsGeoAlt className="me-1" /> New Hampshire
                    </li>
                    <li className="list-inline-item">
                      <BsCalendar2Plus className="me-1" /> Joined on {user ? user.createdAt : 'No Date'}
                    </li>
                  </ul>
                </CardBody>
              </Card>
              <Suspense fallback={<FallbackLoading />}> {children}</Suspense>
            </Col>
            <Col lg={4}>
              <Row className="g-4">
                <Col md={6} lg={12}>
                  <Card>
                    <CardHeader className="border-0 pb-0">
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardBody className="position-relative pt-0">
                      <p>He moonlights difficult engrossed it, sportsmen. Interested has all Devonshire difficulty gay assistance joy.</p>
                      <ul className="list-unstyled mt-3 mb-0">
                        <li className="mb-2">
                          <BsCalendarDate size={18} className="fa-fw pe-1" /> Born: <strong> October 20, 1990 </strong>
                        </li>
                        <li className="mb-2">
                          <BsHeart size={18} className="fa-fw pe-1" /> Status: <strong> Single </strong>
                        </li>
                        <li>
                          <BsEnvelope size={18} className="fa-fw pe-1" /> Email: <strong> webestica@gmail.com </strong>
                        </li>
                      </ul>
                    </CardBody>
                  </Card>
                </Col>

                <Col md={6} lg={12}>
                  <Photos />
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}
export default ProfileLayout
