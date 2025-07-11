import { useState } from 'react'
import { Col } from 'react-bootstrap'
import Feeds from './components/Feeds'
import CreatePostCard from '@/components/cards/CreatePostCard'
import { SocialPostType } from '@/types/data'
import { motion } from 'framer-motion'

const Home = () => {
  const [newPost, setNewPost] = useState<SocialPostType | null>(null)
  const [feedType, setFeedType] = useState<'fresh' | 'following' | 'personalized'>('fresh')

  const buttonWidth = 80

  return (
    <Col md={8} lg={6} className="vstack gap-4">
      <CreatePostCard onPostCreated={setNewPost} />

      <div className="d-flex justify-content-center position-relative border-bottom pb-2 mb-2">
        <div className="d-flex gap-4">
          <button className="btn btn-link fw-bold text-decoration-none px-2" onClick={() => setFeedType('fresh')}>
            Fresh
          </button>
          <button className="btn btn-link fw-bold text-decoration-none px-2" onClick={() => setFeedType('following')}>
            Following
          </button>
          <button className="btn btn-link fw-bold text-decoration-none px-2" onClick={() => setFeedType('personalized')}>
            For You ✨
          </button>
        </div>

        <motion.div
          className="position-absolute bottom-0"
          layoutId="underline"
          style={{
            height: 3,
            width: buttonWidth,
            backgroundColor: '#0d6efd',
            borderRadius: 2,
            left: feedType === 'fresh' ? 'calc(50% - 80px)' : feedType === 'following' ? 'calc(50% - 0px)' : 'calc(50% + 80px)',
            transition: 'left 0.3s ease',
          }}
        />
      </div>

      <Feeds newPost={newPost} feedType={feedType} />
    </Col>
  )
}

export default Home
