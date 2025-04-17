import { Col } from 'react-bootstrap'
import Feeds from './components/Feeds'
import CreatePostCard from '@/components/cards/CreatePostCard'

const Home = () => {
  return (
    <>
      <Col md={8} lg={6} className="vstack gap-4">
        <CreatePostCard />
        <Feeds />
      </Col>
    </>
  )
}

export default Home
