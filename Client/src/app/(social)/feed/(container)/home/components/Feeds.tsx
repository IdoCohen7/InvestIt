// ✅ Feeds.tsx (מעודכן לתמיכה במחיקת פוסטים)
import { useState } from 'react'
import { getAllFeeds } from '@/helpers/data'
import PostCard from '@/components/cards/PostCard'
import LoadMoreButton from './LoadMoreButton'
import { SocialPostType } from '@/types/data'
import { useEffect } from 'react'
import { Button, Card, CardFooter, CardHeader, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsFlag, BsInfoCircle, BsPersonX, BsSlashCircle, BsThreeDots } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import logo12 from '@/assets/images/logo/12.svg'
import postImg2 from '@/assets/images/post/3by2/02.jpg'

const ActionMenu = ({ name }: { name?: string }) => {
  return (
    <Dropdown drop="start">
      <DropdownToggle as="a" className="text-secondary btn btn-secondary-soft-hover py-1 px-2 content-none" id="cardFeedAction">
        <BsThreeDots />
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end" aria-labelledby="cardFeedAction">
        <li>
          <DropdownItem>
            <BsPersonX size={22} className="fa-fw pe-2" /> Unfollow {name}
          </DropdownItem>
        </li>
        <li>
          <DropdownItem>
            <BsSlashCircle size={22} className="fa-fw pe-2" /> Block
          </DropdownItem>
        </li>
        <li>
          <DropdownDivider />
        </li>
        <li>
          <DropdownItem>
            <BsFlag size={22} className="fa-fw pe-2" /> Report post
          </DropdownItem>
        </li>
      </DropdownMenu>
    </Dropdown>
  )
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SponsoredCard = () => (
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
              <BsInfoCircle className="ps-1" />
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

const Feeds = () => {
  const [posts, setPosts] = useState<SocialPostType[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [deletedPostIds, setDeletedPostIds] = useState<number[]>([])

  const fetchPage = async () => {
    setIsLoading(true)
    try {
      const newPosts = await getAllFeeds(page, 3)
      if (newPosts.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prev) => {
          const newUniquePosts = newPosts.filter((newPost) => !prev.some((existingPost) => existingPost.postId === newPost.postId))
          return [...prev, ...newUniquePosts]
        })
        setPage((prev) => prev + 1)
      }
    } catch (err) {
      console.error('Failed to load more posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePostDelete = (postId: number) => {
    setDeletedPostIds((prev) => [...prev, postId])
  }

  useEffect(() => {
    fetchPage()
  }, []) // fetch initial posts

  return (
    <>
      {posts
        .filter((post) => !deletedPostIds.includes(post.postId))
        .map((post) => (
          <PostCard {...post} key={post.postId} onDelete={handlePostDelete} />
        ))}

      {hasMore && !isLoading && <LoadMoreButton onClick={fetchPage} />}
      {isLoading && <p className="text-center">Loading...</p>}
    </>
  )
}

export default Feeds
