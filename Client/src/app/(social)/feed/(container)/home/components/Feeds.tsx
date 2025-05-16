import { useState, useEffect } from 'react'
import PostCard from '@/components/cards/PostCard'
import LoadMoreButton from './LoadMoreButton'
import { SocialPostType } from '@/types/data'
import { useAuthContext } from '@/context/useAuthContext'
import { Button, Card, CardFooter, CardHeader, Dropdown, DropdownDivider, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { BsFlag, BsInfoCircle, BsPersonX, BsSlashCircle, BsThreeDots } from 'react-icons/bs'
import { Link } from 'react-router-dom'
import logo12 from '@/assets/images/logo/12.svg'
import postImg2 from '@/assets/images/post/3by2/02.jpg'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthFetch } from '@/hooks/useAuthFetch' // שימוש ב-useAuthFetch
import { API_URL } from '@/utils/env'

const ActionMenu = ({ name }: { name?: string }) => (
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

const Feeds = ({ newPost }: { newPost: SocialPostType | null }) => {
  const [posts, setPosts] = useState<SocialPostType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [deletedPostIds, setDeletedPostIds] = useState<number[]>([])
  const { user } = useAuthContext()
  const authFetch = useAuthFetch()

  const fetchPage = async () => {
    setIsLoading(true)
    try {
      const offset = posts.filter((p) => !deletedPostIds.includes(p.postId)).length
      const nextPage = Math.floor(offset / 3) + 1

      // קריאת הפוסטים ישירות עם authFetch כולל טוקן
      const res = await authFetch(`${API_URL}/Post?userId=${user?.userId ?? ''}&page=${nextPage}&pageSize=3`, { method: 'GET', mode: 'cors' })

      if (res.length === 0) {
        setHasMore(false)
      } else {
        const unique = res.filter((p: SocialPostType) => !posts.some((ex) => ex.postId === p.postId))
        setPosts((prev) => [...prev, ...unique])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (newPost && !posts.some((p) => p.postId === newPost.postId)) {
      setPosts((prev) => [newPost, ...prev])
    }
  }, [newPost])

  return (
    <>
      <AnimatePresence>
        {posts
          .filter((post) => !deletedPostIds.includes(post.postId))
          .map((post) => (
            <motion.div
              key={post.postId}
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}>
              <PostCard {...post} onDelete={handlePostDelete} hasLiked={post.hasLiked} />
            </motion.div>
          ))}
      </AnimatePresence>

      {hasMore && !isLoading && <LoadMoreButton onClick={fetchPage} />}
      {isLoading && <p className="text-center">Loading...</p>}
    </>
  )
}

export default Feeds
