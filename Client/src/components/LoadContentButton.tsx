import useToggle from '@/hooks/useToggle'
import clsx from 'clsx'
import { Button } from 'react-bootstrap'

const LoadContentButton = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const { isTrue: isOpen, toggle } = useToggle()

  const handleClick = () => {
    toggle()
    onClick?.() // מפעיל את onClick אם הוא קיים
  }

  return (
    <Button
      onClick={handleClick}
      variant="link"
      role="button"
      className={clsx(className, 'btn-link-loader btn-sm text-secondary d-flex align-items-center', { active: isOpen })}
      data-bs-toggle="button"
      aria-pressed="true">
      <div className="spinner-dots me-2">
        <span className="spinner-dot" />
        <span className="spinner-dot" />
        <span className="spinner-dot" />
      </div>
      {name}
    </Button>
  )
}
export default LoadContentButton
