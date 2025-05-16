import { useEffect, useState } from 'react'
import { Card, Button, Spinner } from 'react-bootstrap'
import { NewsItem } from '@/types/data'
import { API_URL } from '@/utils/env'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { motion, AnimatePresence } from 'framer-motion'

const NewsPage = () => {
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [visibleCount, setVisibleCount] = useState(3)
  const [loading, setLoading] = useState(true)
  const authFetch = useAuthFetch()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data: NewsItem[] = await authFetch(`${API_URL}/Finnhub/market-news`)
        setAllNews(data)
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [authFetch])

  const visibleNews = allNews.slice(0, visibleCount)

  return (
    <div className="container py-4" style={{ marginTop: '60px' }}>
      <h2 className="mb-4">📰 Latest News</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          <AnimatePresence>
            {visibleNews.map((news) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex gap-3">
                      <img src={news.image} alt="news" width={100} height={100} />
                      <div>
                        <Card.Title>{news.headline}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{news.source}</Card.Subtitle>
                        <Card.Text>{news.summary}</Card.Text>
                        <a href={news.url} target="_blank" rel="noreferrer" className="btn btn-outline-primary btn-sm">
                          Read more
                        </a>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {visibleCount < allNews.length && (
            <div className="text-center mt-4">
              <Button onClick={() => setVisibleCount((prev) => prev + 3)}>More News</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NewsPage
