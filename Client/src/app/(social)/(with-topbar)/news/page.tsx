import { useEffect, useState } from 'react'
import { Card, Button, Spinner } from 'react-bootstrap'
import { NewsItem } from '@/types/data'

const NewsPage = () => {
  const [allNews, setAllNews] = useState<NewsItem[]>([])
  const [visibleCount, setVisibleCount] = useState(3)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('https://localhost:7204/api/Finnhub/market-news') // שים את ה-API שלך כאן
        const data: NewsItem[] = await res.json()
        setAllNews(data)
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const visibleNews = allNews.slice(0, visibleCount)

  return (
    <div className="container py-4" style={{ marginTop: '60px' }}>
      <h2 className="mb-4">📰 Latest News</h2>

      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
          {visibleNews.map((news) => (
            <Card key={news.id} className="mb-3 shadow-sm">
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
          ))}

          {visibleCount < allNews.length && (
            <div className="text-center mt-4">
              <Button onClick={() => setVisibleCount(visibleCount + 3)}>More News</Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default NewsPage
