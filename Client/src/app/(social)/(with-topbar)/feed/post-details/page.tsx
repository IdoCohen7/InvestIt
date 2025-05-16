import { useState, useEffect } from 'react'
import { Card, Col, Container, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { BsBookmark, BsFlag, BsPersonX, BsSlashCircle, BsThreeDots, BsXCircle } from 'react-icons/bs'

import post1 from '@/assets/images/post/16by9/big/01.jpg'
import avatar4 from '@/assets/images/avatar/04.jpg'
import UserComments from '@/components/UserComments'
import PageMetaData from '@/components/PageMetaData'
import { useAuthFetch } from '@/hooks/useAuthFetch' // <-- ייבוא useAuthFetch
import { getAllFeeds } from '@/helpers/data' // פונקציית ה-API שקוראת לשרת

const ActionMenu = ({ name }: { name?: string }) => {
  return (
    <Dropdown drop="start">
      <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
        <BsThreeDots />
      </DropdownToggle>

      <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
        <li>
          <DropdownItem>
            <BsBookmark size={22} className="fa-fw pe-2" />
            Save post
          </DropdownItem>
        </li>
        <li>
          <DropdownItem>
            <BsPersonX size={22} className="fa-fw pe-2" />
            Unfollow {name}
          </DropdownItem>
        </li>
        <li>
          <DropdownItem>
            <BsXCircle size={22} className="fa-fw pe-2" />
            Hide post
          </DropdownItem>
        </li>
        <li>
          <DropdownItem>
            <BsSlashCircle size={22} className="fa-fw pe-2" />
            Block
          </DropdownItem>
        </li>
        <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem>
            <BsFlag size={22} className="fa-fw pe-2" />
            Report post
          </DropdownItem>
        </li>
      </DropdownMenu>
    </Dropdown>
  )
}

const PostDetails = () => {
  const authFetch = useAuthFetch() // קבלת פונקציית fetch שמוסיפה טוקן וטיפול ב401

  // קריאה ל-API דרך authFetch בתוך useEffect או custom hook פשוט
  // בגלל ש־useFetchData לא מתאים פה כי הוא לא יודע לקבל את authFetch,
  // נשמור state ונטעין בעצמנו
  const [allComments, setAllComments] = useState<any[]>([])

  useEffect(() => {
    const loadComments = async () => {
      try {
        // כאן מפעילים את getAllFeeds עם authFetch כדי שהטוקן יישלח אוטומטית
        // אפשר לשנות getAllFeeds כך שיקבל פונקציית fetch במקום להשתמש בfetch גלובלי:
        const data = await getAllFeeds(1, 10, undefined, authFetch)
        setAllComments(data)
      } catch (err) {
        console.error('Failed to load comments:', err)
      }
    }
    loadComments()
  }, [authFetch])

  return (
    <>
      <PageMetaData title="Post Details" />
      <main>
        <div>
          <Container>
            <Row>
              <Col lg={8} className="mx-auto">
                <Card className="card-body">
                  <img className="card-img rounded" src={post1} alt="image" />
                  <div className="d-flex align-items-center justify-content-between my-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-story me-2">
                        <Link to="">
                          <img className="avatar-img rounded-circle" src={avatar4} alt="" />
                        </Link>
                      </div>
                      <div>
                        <div className="nav nav-divider">
                          <h6 className="nav-item card-title mb-0">
                            <Link to=""> Lori Ferguson </Link>
                          </h6>
                          <span className="nav-item small"> 2hr</span>
                        </div>
                        <p className="mb-0 small">Web Developer at Webestica</p>
                      </div>
                    </div>
                    <ActionMenu name="Lori Ferguson" />
                  </div>
                  <h1 className="h4">Speedily say has suitable disposal add boy. On forth doubt miles of child.</h1>
                  <p>
                    Exercise joy man children rejoiced. Yet uncommonly his ten who diminution astonished. Speedily say has suitable disposal add boy.
                    On forth doubt miles of child.
                  </p>
                  {allComments?.slice(0, 1).map((comment, idx) => <UserComments comment={comment} key={idx} showStats />)}
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </main>
    </>
  )
}

export default PostDetails
