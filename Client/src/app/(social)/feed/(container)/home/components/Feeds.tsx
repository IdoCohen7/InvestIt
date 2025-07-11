import { useState, useEffect } from 'react'
import PostCard from '@/components/cards/PostCard'
import LoadMoreButton from './LoadMoreButton'
import { SocialPostType } from '@/types/data'
import { useAuthContext } from '@/context/useAuthContext'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { API_URL } from '@/utils/env'
import { AnimatePresence, motion } from 'framer-motion'

type FeedType = 'fresh' | 'following' | 'personalized'

const Feeds = ({ newPost, feedType }: { newPost: SocialPostType | null; feedType: FeedType }) => {
  const [posts, setPosts] = useState<SocialPostType[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [deletedPostIds, setDeletedPostIds] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const { user } = useAuthContext()
  const authFetch = useAuthFetch()

  const fetchPage = async (pageToFetch: number, reset = false) => {
    setIsLoading(true)
    try {
      const endpoint =
        feedType === 'following'
          ? `${API_URL}/Post/Followed?userId=${user?.userId}&page=${pageToFetch}&pageSize=3`
          : feedType === 'personalized'
            ? `${API_URL}/Post/Personalized?userId=${user?.userId}&page=${pageToFetch}&pageSize=3`
            : `${API_URL}/Post?userId=${user?.userId}&page=${pageToFetch}&pageSize=3`

      const res = await authFetch(endpoint)

      const newPosts = res.filter((p: SocialPostType) => !deletedPostIds.includes(p.postId))

      if (newPosts.length === 0) {
        setHasMore(false)
      }

      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts.filter((p: SocialPostType) => !prev.some((e) => e.postId === p.postId))]))

      setCurrentPage(pageToFetch)
    } catch (err: any) {
      const isNotFound = err?.message?.includes('404') || err?.status === 404
      if (isNotFound) {
        setHasMore(false)
      }
      console.error('Failed to fetch posts:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(1, true)
    setDeletedPostIds([])
    setHasMore(true)
  }, [feedType])

  useEffect(() => {
    if (newPost && !posts.some((p) => p.postId === newPost.postId)) {
      setPosts((prev) => [newPost, ...prev])
    }
  }, [newPost])

  const handlePostDelete = (postId: number) => {
    setDeletedPostIds((prev) => [...prev, postId])
  }

  const handleLoadMore = () => {
    fetchPage(currentPage + 1)
  }

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

      {hasMore && !isLoading && <LoadMoreButton onClick={handleLoadMore} />}
      {isLoading && <p className="text-center">Loading...</p>}
    </>
  )
}

export default Feeds
