import { useEffect, useState } from 'react'
import { API_URL } from '@/utils/env'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import { supabase } from '@/supabase/supabase'
import { useAuthContext } from '@/context/useAuthContext'
import placeHolder from '@/assets/images/avatar/placeholder.jpg'
import { BsPatchCheckFill } from 'react-icons/bs'
import { set } from 'react-hook-form'

export default function ChatPage() {
  const authFetch = useAuthFetch()
  const { user } = useAuthContext()
  const [chats, setChats] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [participants, setParticipants] = useState<Record<number, any>>({})
  const [newMessage, setNewMessage] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)

  const checkExpertChat = async (chat: any) => {
    const otherUserId = chat.otherUserId
    const participant = participants[otherUserId]

    // if the other user is an expert, we need to validate the consultation
    if (participant?.expertiseArea) {
      try {
        const res = await authFetch(`${API_URL}/User/Consultation/Valid?userId=${user?.userId}&expertId=${otherUserId}`)
        if (res.consultationStatus != 1) {
          alert('You do not have an active consultation with this expert.')
          return
        }
      } catch (err) {
        console.error('❌ Failed to validate consultation before opening chat:', err)
        alert('Unable to verify consultation status. Please try again later.')
        return
      }
    }

    // if everything is fine, set the active chat
    setActiveChat(chat)
  }

  useEffect(() => {
    const loadChatsAndUsers = async () => {
      try {
        const chatList = await authFetch(`${API_URL}/Supabase/GetUserPrivateChats`)
        setChats(chatList)

        const otherUserIds = chatList
          .map((chat: any) => chat.otherUserId)
          .filter((id: number | null): id is number => id !== null)
          .filter((id, index, arr) => arr.indexOf(id) === index)

        const fetchedUsers = await Promise.all(
          otherUserIds.map(async (id) => {
            const response = await authFetch(`${API_URL}/User/${id}?viewerId=${user?.userId}`)
            return { id, data: response }
          }),
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
          filter: `chat_id=eq.${activeChat.id}`,
        },
        async (payload) => {
          const newMsg = {
            ...payload.new,
            sentAt: new Date(payload.new.sent_at),
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
        },
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
        body: JSON.stringify({ chatId: activeChat.id, message: newMessage }),
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
            {chats.map((chat) => {
              const otherUserId = chat.otherUserId
              const participant = participants[otherUserId]
              const name = participant ? `${participant.firstName} ${participant.lastName}` : chat.otherUserName || `User ${otherUserId}`
              const profilePic = participant?.profilePic || chat.otherUserProfilePic || placeHolder

              return (
                <li
                  key={chat.id}
                  className={`list-group-item d-flex align-items-center gap-2 ${activeChat?.id === chat.id ? 'active' : ''}`}
                  onClick={() => checkExpertChat(chat)}
                  role="button">
                  <img src={profilePic} alt="Profile" style={{ width: 35, height: 35, borderRadius: '50%' }} />
                  <div className="d-flex align-items-center gap-1">
                    {name}
                    {participant?.expertiseArea && <BsPatchCheckFill className="text-warning small" title="Verified Expert" />}
                  </div>
                </li>
              )
            })}
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
                <h5>
                  Chat with{' '}
                  {participants[activeChat.otherUserId]
                    ? `${participants[activeChat.otherUserId].firstName}`
                    : activeChat.otherUserName || `User ${activeChat.otherUserId}`}
                </h5>
                <div className="border rounded p-3 mb-3" style={{ height: '300px', overflowY: 'auto' }}>
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === user?.userId
                    const sender = isOwnMessage ? user : participants[msg.senderId]
                    const senderName = sender ? `${sender.firstName} ${sender.lastName}` : `User ${msg.senderId}`

                    return (
                      <div
                        key={msg.id}
                        className={`mb-2 d-flex ${isOwnMessage ? 'justify-content-end text-end' : 'justify-content-start text-start'}`}>
                        <div
                          className={`p-2 rounded ${isOwnMessage ? 'bg-primary text-white' : 'bg-light'}`}
                          style={{ maxWidth: '70%', display: 'inline-block' }}>
                          <strong>{senderName}:</strong> {msg.content}
                          <br />
                          <small className="text-muted">{msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''}</small>
                        </div>
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
