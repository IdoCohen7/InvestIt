import { useState } from 'react'
import { Col } from 'react-bootstrap'
import Feeds from './components/Feeds'
import CreatePostCard from '@/components/cards/CreatePostCard'
import { SocialPostType } from '@/types/data'
import { motion } from 'framer-motion'

const Home = () => {
  const [newPost, setNewPost] = useState<SocialPostType | null>(null)
  const [filterFollowedOnly, setFilterFollowedOnly] = useState(false)

  return (
    <Col md={8} lg={6} className="vstack gap-4">
      <CreatePostCard onPostCreated={setNewPost} />
      <div className="d-flex justify-content-center position-relative border-bottom pb-2 mb-2">
        <div className="d-flex gap-4">
          <button className="btn btn-link fw-bold text-decoration-none px-2" onClick={() => setFilterFollowedOnly(false)}>
            For You
          </button>
          <button className="btn btn-link fw-bold text-decoration-none px-2" onClick={() => setFilterFollowedOnly(true)}>
            Following
          </button>
        </div>

        <motion.div
          className="position-absolute bottom-0"
          layoutId="underline"
          style={{
            height: 3,
            width: 70,
            backgroundColor: '#0d6efd',
            borderRadius: 2,
            left: filterFollowedOnly ? '50%' : 'calc(50% - 70px)',
            transition: 'left 0.3s ease',
          }}
        />
      </div>

      <Feeds newPost={newPost} followedOnly={filterFollowedOnly} />
    </Col>
  )
}

export default Home
