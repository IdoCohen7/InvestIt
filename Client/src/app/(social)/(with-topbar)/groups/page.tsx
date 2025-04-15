import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/supabase/supabase'
import { Card, Col, Container, Row, Button, Form } from 'react-bootstrap'
import PageMetaData from '@/components/PageMetaData'
import { useAuthContext } from '@/context/useAuthContext'

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
      <main>
        <Container>
          <Row className="gx-0">
            <Col lg={4} xxl={3}>
              <Card className="card-body border-end-0 border-bottom-0 rounded-bottom-0">
                <h1 className="h5 mb-3">Groups</h1>
                <ul className="list-group">
                  <li className="list-group-item active">📈 Stocks</li>
                </ul>
              </Card>
            </Col>
            <Col lg={8} xxl={9}>
              <Card className="p-3" style={{ direction: 'rtl' }}>
                <div className="mb-3">
                  <h5>💬 Chat in Stocks</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {messages.map((msg) => {
                      const isMyMessage = msg.userId === user?.userId
                      return (
                        <div
                          key={msg.id}
                          className={`mb-2 p-2 rounded ${isMyMessage ? 'bg-primary text-white text-end ms-auto' : 'bg-light text-start me-auto'}`}
                          style={{ maxWidth: '75%' }}>
                          <div className="fw-bold">{msg.name}</div>
                          <div>{msg.content}</div>
                          <div className="text-muted small">{new Date(msg.created_at).toLocaleTimeString()}</div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <Form className="d-flex flex-column gap-2">
                  <Form.Control
                    placeholder="Type a message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                  <Button variant="primary" onClick={createMessage}>
                    Send
                  </Button>
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
