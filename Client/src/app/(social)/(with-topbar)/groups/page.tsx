import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabase/supabase'
import { Card, Button, Form, Row, Col, Container } from 'react-bootstrap'
import PageMetaData from '@/components/PageMetaData'
import { useAuthContext } from '@/context/useAuthContext'
import { useNavigate } from 'react-router-dom'

interface Message {
  id: number
  name: string
  content: string
  created_at: string
  userId?: number
}

const GroupsPage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  const { user } = useAuthContext()
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  async function fetchMessages(): Promise<void> {
    const { data, error } = await supabase.from('Stocks').select('id, name, content, created_at, userId')
    if (error) console.error('Error fetching messages:', error)
    else setMessages(data ?? [])
  }

  async function createMessage(): Promise<void> {
    if (!content.trim()) return

    const { error } = await supabase.from('Stocks').insert([
      {
        name: fullName,
        content: content.trim(),
        userId: user?.userId,
      },
    ])

    if (!error) setContent('')
  }

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('supabase_realtime_messages_publication')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Stocks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [...prev, payload.new as Message])
        } else if (payload.eventType === 'UPDATE') {
          setMessages((prev) => prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg)))
        } else if (payload.eventType === 'DELETE') {
          setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      createMessage()
    }
  }

  return (
    <>
      <PageMetaData title="Groups Chat" />
      <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Container fluid className="flex-grow-1 p-0">
          <Row className="gx-0 h-100">
            <Col lg={4} xxl={3} className="border-end">
              <Card className="h-100 rounded-0 border-end-0 border-bottom-0">
                <Card.Body>
                  <h1 className="h5 mb-3">Groups</h1>
                  <ul className="list-group">
                    <li className="list-group-item active">📈 Stocks</li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
            <Col lg={8} xxl={9} className="d-flex flex-column">
              <Card className="p-3 flex-grow-1 rounded-0 border-0" style={{ direction: 'rtl', display: 'flex', flexDirection: 'column' }}>
                <div className="mb-3">
                  <h5>💬 Chat in Stocks</h5>
                  <div className="flex-grow-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 230px)' }}>
                    {messages.map((msg) => {
                      const isMyMessage = msg.userId === user?.userId
                      return (
                        <div
                          key={msg.id}
                          className={`mb-2 p-2 rounded ${isMyMessage ? 'bg-primary text-white text-end ms-auto' : 'bg-light text-start me-auto'}`}
                          style={{ maxWidth: '60%' }}>
                          <div
                            className="fw-bold"
                            style={{ cursor: 'pointer', transition: '0.2s' }}
                            onClick={() => navigate(`/profile/feed/${msg.userId}`)}
                            onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}>
                            {msg.name}
                          </div>
                          <div>{msg.content}</div>
                          <div className="text-muted small">{new Date(msg.created_at).toLocaleTimeString()}</div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <Form>
                  <div className="d-flex gap-2 align-items-end justify-content-center" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                    <Form.Control
                      placeholder="...Type a message"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    <Button variant="primary" onClick={createMessage}>
                      Send
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </>
  )
}

export default GroupsPage
