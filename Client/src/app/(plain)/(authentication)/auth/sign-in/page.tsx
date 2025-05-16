import { Card } from 'react-bootstrap'
import LoginForm from './components/LoginForm'
import { Link, useLocation } from 'react-router-dom'
import PageMetaData from '@/components/PageMetaData'
import AuthLayout from '../components/AuthLayout'
import { useNotificationContext } from '@/context/useNotificationContext'
import { useEffect, useState } from 'react'

const SignIn = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const fromUnauthorized = params.get('from') === 'unauthorized'
  const { showNotification } = useNotificationContext()
  const [notified, setNotified] = useState(false)

  useEffect(() => {
    if (fromUnauthorized && !notified) {
      showNotification({
        message: 'Your session expired, log in again.',
        variant: 'warning',
      })
      setNotified(true)
    }
  }, [fromUnauthorized, notified, showNotification])

  return (
    <>
      <PageMetaData title="Sign In" />
      <AuthLayout>
        <Card className="card-body text-center p-4 p-sm-5 bg-light bg-opacity-75 animate-float">
          <h1 className="mb-2">Sign in</h1>

          <p className="mb-0">
            Don&apos;t have an account?<Link to="/auth/sign-up"> Click here to sign up</Link>
          </p>
          <LoginForm />
        </Card>
      </AuthLayout>
    </>
  )
}

export default SignIn
