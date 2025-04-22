import { useState } from 'react'
import { Col } from 'react-bootstrap'
import Feeds from './components/Feeds'
import CreatePostCard from '@/components/cards/CreatePostCard'
import { SocialPostType } from '@/types/data'

const Home = () => {
  const [newPost, setNewPost] = useState<SocialPostType | null>(null)

  return (
    <Col md={8} lg={6} className="vstack gap-4">
      <CreatePostCard onPostCreated={setNewPost} />
      <Feeds newPost={newPost} />
    </Col>
  )
}

export default Home
