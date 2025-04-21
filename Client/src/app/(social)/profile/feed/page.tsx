import { useParams } from 'react-router-dom'
import Posts from './components/Posts'
import PageMetaData from '@/components/PageMetaData'
import ProfileLayout from '@/layouts/ProfileLayout'

const Feed = () => {
  const { userId } = useParams<{ userId: string }>()

  if (!userId) return <p>No user ID provided</p>

  return (
    <>
      <PageMetaData title="Feed" />
      <ProfileLayout userId={userId}>
        <Posts userId={userId} />
      </ProfileLayout>
    </>
  )
}

export default Feed
