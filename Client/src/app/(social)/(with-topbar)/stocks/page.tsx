import { useEffect, useRef, useState } from 'react'
import { Card, Row, Col } from 'react-bootstrap'

type SymbolData = {
  price: number
  volume: number
  lastUpdated: number
  previousPrice?: number
}

const symbolsToTrack = ['BINANCE:BTCUSDT', 'AAPL', 'MSFT', 'AMZN', 'GOOG', 'META', 'NVDA', 'TSLA', 'BRK.B', 'JPM']

const LivePrices = () => {
  const [prices, setPrices] = useState<Record<string, SymbolData>>({})
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    socketRef.current = new WebSocket('wss://localhost:7204/ws/prices')

    socketRef.current.onopen = () => console.log('📡 WebSocket connected')

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'trade' && Array.isArray(message.data)) {
          setPrices((prev) => {
            const updated = { ...prev }
            message.data.forEach((trade: any) => {
              const prevPrice = prev[trade.s]?.price
              updated[trade.s] = {
                price: trade.p,
                volume: trade.v,
                lastUpdated: Date.now(),
                previousPrice: prevPrice,
              }
            })
            return updated
          })
        }
      } catch (err) {
        console.error('❌ Error parsing WebSocket message:', err)
      }
    }

    socketRef.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err)
    }

    return () => {
      socketRef.current?.close()
    }
  }, [])

  return (
    <div className="container py-4" style={{ marginTop: '80px' }}>
      <h2 className="mb-4 text-center">📊 Live Market Prices</h2>
      <Row xs={1} sm={2} md={3} lg={5} className="g-3">
        {symbolsToTrack.map((symbol) => {
          const data = prices[symbol]
          const isStale = data && Date.now() - data.lastUpdated > 30000
          const priceChange =
            data?.previousPrice !== undefined ? (data.price > data.previousPrice ? 'up' : data.price < data.previousPrice ? 'down' : 'same') : 'same'

          return (
            <Col key={symbol}>
              <Card className="h-100 shadow-sm text-center">
                <Card.Body>
                  <Card.Title className="mb-2">{symbol}</Card.Title>
                  <h5 className={isStale ? 'text-muted' : priceChange === 'up' ? 'text-success' : priceChange === 'down' ? 'text-danger' : ''}>
                    {data ? (
                      isStale ? (
                        '⛔ No recent data'
                      ) : (
                        <>
                          ${data.price.toFixed(2)} {priceChange === 'up' ? '▲' : priceChange === 'down' ? '▼' : ''}
                        </>
                      )
                    ) : (
                      'Loading...'
                    )}
                  </h5>
                  {!isStale && data && <p className="text-muted small mb-0">Vol: {data.volume}</p>}
                </Card.Body>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

export default LivePrices
