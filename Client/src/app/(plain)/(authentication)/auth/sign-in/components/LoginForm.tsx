import { currentYear, developedBy, developedByLink } from '@/context/constants'
import { Link } from 'react-router-dom'
import useSignIn from './useSignIn'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import { Button } from 'react-bootstrap'

const LoginForm = () => {
  const { loading, login, control } = useSignIn()

  return (
    <form className="mt-sm-4" onSubmit={login}>
      <TextFormInput name="email" type="email" placeholder="Enter email" control={control} containerClassName="mb-3 input-group-lg" />
      <div className="mb-3 position-relative">
        <PasswordFormInput name="password" placeholder="Enter password" control={control} size="lg" containerClassName="w-100" />
      </div>
      <div className="d-grid">
        <Button variant="primary" size="lg" type="submit" disabled={loading}>
          Login
        </Button>
      </div>
      <p className="mb-0 mt-3 text-center">
        ©{currentYear}
        <Link target="_blank" to={developedByLink}>
          {developedBy}
        </Link>
        . All rights reserved
      </p>
    </form>
  )
}

export default LoginForm
