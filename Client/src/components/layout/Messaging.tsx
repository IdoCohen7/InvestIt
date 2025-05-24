import { useEffect, useState } from 'react'
import { API_URL } from '@/utils/env'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { supabase } from '@/supabase/supabase'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'

export default function ChatPage() {
  const authFetch = useAuthFetch()
  const { user } = useAuthContext()
  const [chats, setChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [participants, setParticipants] = useState<Record<number, any>>({})
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)

  useEffect(() => {
    const loadChatsAndUsers = async () => {
      try {
        const chatList = await authFetch(`${API_URL}/Supabase/GetUserPrivateChats`)
        setChats(chatList)

        const otherUserIds = chatList
          .map((chat: any) => (chat.user1Id === user?.userId ? chat.user2Id : chat.user1Id))
          .filter((id: number, index: number, arr: number[]) => arr.indexOf(id) === index)

        const fetchedUsers = await Promise.all(
          otherUserIds.map(async (id) => {
            const response = await authFetch(`${API_URL}/User/${id}?viewerId=${user?.userId}`)
            return { id, data: response }
          })
        )

        const usersById: Record<number, any> = {}
        fetchedUsers.forEach(({ id, data }) => {
          usersById[id] = data
        })

        setParticipants(usersById)
      } catch (err) {
        console.error('❌ Failed to load chats or users', err)
      }
    }

    if (user) loadChatsAndUsers()
  }, [])

  useEffect(() => {
    if (!activeChat) return

    const loadMessages = async () => {
      try {
        setLoadingMessages(true)
        const data = await authFetch(`${API_URL}/Supabase/GetPrivateMessages?chatId=${activeChat.id}`)
        setMessages(data)
      } catch (err) {
        console.error('❌ Failed to fetch messages', err)
      } finally {
        setLoadingMessages(false)
      }
    }

    loadMessages()
  }, [activeChat])

  useEffect(() => {
    if (!activeChat) return

    const channel = supabase
      .channel(`chat-${activeChat.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'PrivateMessages',
          filter: `chat_id=eq.${activeChat.id}`
        },
        async (payload) => {
          const newMsg = {
            ...payload.new,
            sentAt: new Date(payload.new.sent_at)
          }

          const senderId = newMsg.senderId
          if (!participants[senderId] && senderId !== user?.userId) {
            try {
              const fetched = await authFetch(`${API_URL}/User/${senderId}?viewerId=${user?.userId}`)
              setParticipants((prev) => ({ ...prev, [senderId]: fetched }))
            } catch (err) {
              console.error('❌ Failed to fetch participant on realtime:', err)
            }
          }

          setMessages((prev) => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeChat, participants])

  const sendMessage = async () => {
    if (!activeChat || !newMessage.trim()) return
    try {
      await authFetch(`${API_URL}/Supabase/SendPrivateMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChat.id, message: newMessage })
      })
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message', err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">💬 Private Chat</h2>
      <div className="row">
        <div className="col-md-4">
          <h5>Your Chats</h5>
          <ul className="list-group">
            {chats.map((chat) => (
              <li
                key={chat.id}
                className={`list-group-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
                role="button"
              >
                Chat #{chat.id}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-8">
          {activeChat ? (
            loadingMessages ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div>
                <h5>Chat ID: {activeChat.id}</h5>
                <div className="border rounded p-3 mb-3" style={{ height: '300px', overflowY: 'auto' }}>
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user?.userId
                    const sender = isOwnMessage ? user : participants[msg.senderId]
                    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : `User ${msg.senderId}`
                    const profilePic = sender?.profilePic || placeHolder

                    return (
                      <div
                        key={msg.id}
                        className={`mb-2 d-flex gap-2 ${isOwnMessage ? 'justify-content-end text-end' : 'justify-content-start text-start'}`}
                      >
                        {!isOwnMessage && (
                          <img
                            src={profilePic}
                            alt="Profile"
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                          />
                        )}
                        <div>
                          <strong>{senderName}:</strong> {msg.content}
                          <br />
                          <small className="text-muted">
                            {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}
                          </small>
                        </div>
                        {isOwnMessage && (
                          <img
                            src={profilePic}
                            alt="Profile"
                            style={{ width: 40, height: 40, borderRadius: '50%' }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </div>
            )
          ) : (
            <p>Select a chat to begin.</p>
          )}
        </div>
      </div>
    </div>
  )
}
