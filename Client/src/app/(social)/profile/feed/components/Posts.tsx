import { useEffect, useState } from 'react'
import PostCard from '@/components/cards/PostCard'
import { SocialPostType } from '@/types/data'
import LoadMoreButton from '@/app/(social)/feed/(container)/home/components/LoadMoreButton'
import { useAuthContext } from '@/context/useAuthContext'
import { API_URL } from '@/utils/env'
const Posts = ({ userId }: { userId?: string }) => {
  const [posts, setPosts] = useState<SocialPostType[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { user } = useAuthContext()
  const PAGE_SIZE = 10

  const fetchPosts = async (pageToFetch: number) => {
    if (!userId || !user?.userId) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/Post/UserPage?page=${pageToFetch}&pageSize=${PAGE_SIZE}&userId=${user.userId}&profileUserId=${userId}`)

      if (res.status === 204) {
        if (pageToFetch === 1) {
          setPosts([])
        }
        setHasMore(false)
        return
      }

      const data: SocialPostType[] = await res.json()

      if (data.length < PAGE_SIZE) setHasMore(false)

      if (pageToFetch === 1) {
        setPosts(data)
      } else {
        setPosts((prev) => [...prev, ...data])
      }

      setPage(pageToFetch + 1)
    } catch (err) {
      console.error('Failed to fetch user posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!userId || !user?.userId) return

    setPage(1)
    setHasMore(true)
    fetchPosts(1)
  }, [userId, user?.userId])

  return (
    <div className="mt-4">
      {posts.length === 0 && !isLoading && <p className="text-center text-muted fs-5">No posts found for this user.</p>}

      {posts.map((post) => (
        <div key={post.postId} className="mb-4">
          <PostCard {...post} />
        </div>
      ))}

      {hasMore && !isLoading && <LoadMoreButton onClick={() => fetchPosts(page)} />}
      {isLoading && <p className="text-center">Loading...</p>}
    </div>
  )
}

export default Posts
