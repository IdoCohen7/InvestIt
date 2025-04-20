import { Collapse } from 'react-bootstrap'
import { useLayoutContext } from '@/context/useLayoutContext'
import { BsSearch, BsMicFill } from 'react-icons/bs'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CollapseMenu = ({ isSearch }: { isSearch?: boolean }) => {
  const {
    mobileMenu: { open },
  } = useLayoutContext()
  const [isListening, setIsListening] = useState(false)
  const [searchText, setSearchText] = useState('')
  const navigate = useNavigate()

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'he-IL'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchText(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText.trim())}`)
    }
  }

  return (
    <Collapse in={open} className="navbar-collapse">
      <div>
        {isSearch && (
          <div className="nav mt-3 mt-lg-0 flex-nowrap align-items-center px-4 px-lg-0">
            <div className="nav-item w-100">
              <form className="rounded position-relative" onSubmit={handleSubmit}>
                <input
                  className="form-control ps-5 bg-light"
                  type="search"
                  placeholder="Search..."
                  aria-label="Search"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="btn bg-transparent px-2 py-0 position-absolute top-50 start-0 translate-middle-y" type="submit">
                  <BsSearch className="fs-5" />
                </button>
                <button
                  className="btn bg-transparent px-2 py-0 position-absolute top-50 end-0 translate-middle-y"
                  type="button"
                  onClick={handleVoiceSearch}
                  style={{ color: isListening ? '#7ed957' : 'inherit' }}>
                  <BsMicFill className="fs-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Collapse>
  )
}

export default CollapseMenu
