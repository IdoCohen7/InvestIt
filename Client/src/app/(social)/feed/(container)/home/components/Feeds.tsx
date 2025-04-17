import { getAllFeeds } from '@/helpers/data'

import { Button, Card, CardFooter, CardHeader, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsBookmark, BsFlag, BsInfoCircle, BsPersonX, BsSlashCircle, BsThreeDots, BsXCircle } from 'react-icons/bs'

import logo12 from '@/assets/images/logo/12.svg'
import postImg2 from '@/assets/images/post/3by2/02.jpg'
import PostCard from '@/components/cards/PostCard'
import { Link } from 'react-router-dom'
import LoadMoreButton from './LoadMoreButton'
import { useFetchData } from '@/hooks/useFetchData'

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SponsoredCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="avatar me-2">
              <span role="button">
                <img className="avatar-img rounded-circle" src={logo12} alt="image" />
              </span>
            </div>

            <div>
              <h6 className="card-title mb-0">
                <Link to=""> Bootstrap: Front-end framework </Link>
              </h6>
              <Link to="" className="mb-0 text-body">
                Sponsored
                <BsInfoCircle
                  className="ps-1"
                  data-bs-container="body"
                  data-bs-toggle="popover"
                  data-bs-placement="top"
                  data-bs-content="You're seeing this ad because your activity meets the intended audience of our site."
                />
              </Link>
            </div>
          </div>
          <ActionMenu />
        </div>
      </CardHeader>

      <img src={postImg2} alt="post-image" />

      <CardFooter className="border-0 d-flex justify-content-between align-items-center">
        <p className="mb-0">Currently v5.1.3 </p>
        <Button variant="primary-soft" size="sm">
          Download now
        </Button>
      </CardFooter>
    </Card>
  )
}

const Feeds = () => {
  const allPosts = useFetchData(getAllFeeds)
  return (
    <>
      {allPosts?.map((post, idx) => <PostCard {...post} key={idx} />)}

      <LoadMoreButton />
    </>
  )
}
export default Feeds
