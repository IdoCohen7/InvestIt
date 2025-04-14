import PasswordFormInput from '@/components/form/PasswordFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter'
import { currentYear, developedBy, developedByLink } from '@/context/constants'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import useSignUp from './useSignUp'

const SignUpForm = () => {
  const [firstPassword, setFirstPassword] = useState<string>('')
  const { signUp, control, getValues, loading } = useSignUp()

  useEffect(() => {
    setFirstPassword(getValues().password)
  }, [getValues().password])

  return (
    <form className="mt-4" onSubmit={signUp}>
      <div className="mb-3">
        <TextFormInput name="firstName" control={control} containerClassName="input-group-lg" placeholder="First name" />
      </div>
      <div className="mb-3">
        <TextFormInput name="lastName" control={control} containerClassName="input-group-lg" placeholder="Last name" />
      </div>
      <div className="mb-3">
        <TextFormInput name="email" control={control} containerClassName="input-group-lg" placeholder="Enter your email" />
        <small>We&apos;ll never share your email with anyone else.</small>
      </div>
      <div className="mb-3 position-relative">
        <PasswordFormInput name="password" control={control} size="lg" placeholder="Enter new password" />
        <div className="mt-2">
          <PasswordStrengthMeter password={firstPassword} />
        </div>
      </div>
      <PasswordFormInput name="confirmPassword" control={control} size="lg" containerClassName="mb-3" placeholder="Confirm password" />
      <div className="d-grid">
        <Button variant="primary" type="submit" size="lg" disabled={loading}>
          Sign me up
        </Button>
      </div>
      <p className="mb-0 mt-3 text-center">
        ©{currentYear}
        <Link target="_blank" to={developedByLink}>
          {developedBy}.
        </Link>
        All rights reserved
      </p>
    </form>
  )
}

export default SignUpForm
