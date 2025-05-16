import { useEffect, useState } from 'react'
import LoadMoreButton from '@/app/(social)/feed/(container)/home/components/LoadMoreButton'
import { UserType } from '@/types/auth'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useAuthFetch } from '@/hooks/useAuthFetch' // <-- ייבוא useAuthFetch
import { Link } from 'react-router-dom'
import { API_URL } from '@/utils/env'

interface Props {
  query: string
}

const PAGE_SIZE = 10

const SearchResultsComponent = ({ query }: Props) => {
  const [results, setResults] = useState<UserType[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { showNotification } = useNotificationContext()
  const authFetch = useAuthFetch() // <-- שימוש ב-useAuthFetch

  const fetchResults = async (pageToLoad: number) => {
    if (!query) return
    if (pageToLoad === 1) setLoading(true)

    try {
      const response = await authFetch(`${API_URL}/User/Search?query=${encodeURIComponent(query)}&page=${pageToLoad}&pageSize=${PAGE_SIZE}`)

      const newUsers = response.users || []
      const total = response.totalCount || 0
      setTotalCount(total)
      setResults((prev) => (pageToLoad === 1 ? newUsers : [...prev, ...newUsers]))
    } catch (err) {
      showNotification({ message: 'Error loading users', variant: 'danger' })
    } finally {
      if (pageToLoad === 1) setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchResults(1)
  }, [query])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchResults(nextPage)
  }

  const hasMore = results.length < totalCount

  return (
    <div className="container" style={{ marginTop: '100px' }}>
      <h3 className="mb-4">Search results for: "{query}"</h3>
      {loading && page === 1 ? (
        <p>Loading results...</p>
      ) : results.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <>
          <div className="row">
            {results.map((user) => (
              <div key={user.userId} className="col-sm-6 col-md-4 mb-3">
                <Link to={`/profile/feed/${user.userId}`} className="text-decoration-none" style={{ color: 'inherit' }}>
                  <div
                    className="card h-100 shadow-sm transition-card"
                    style={{
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}>
                    <img
                      src={user.profilePic}
                      className="card-img-top"
                      alt={user.firstName}
                      style={{ objectFit: 'cover', height: '140px', aspectRatio: '4 / 3' }}
                    />
                    <div className="card-body p-2">
                      <h6 className="card-title mb-1">
                        {user.firstName} {user.lastName}
                      </h6>
                      <p className="card-text text-truncate" title={user.bio}>
                        {user.bio}
                      </p>
                      <small className="text-muted">Experience: {user.experienceLevel}</small>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-3">
              <LoadMoreButton onClick={handleLoadMore} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchResultsComponent
