import clsx from 'clsx'
import { Button } from 'react-bootstrap'
import { useState } from 'react'

const LoadMoreButton = ({ onClick }: { onClick: () => void }) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    await onClick()
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleClick}
      variant="primary-soft"
      role="button"
      className={clsx('btn-loader', { active: isLoading })}
      data-bs-toggle="button"
      aria-pressed="true">
      <span className="load-text"> Load more </span>
      <div className="load-icon">
        <div className="spinner-grow spinner-grow-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </Button>
  )
}

export default LoadMoreButton
