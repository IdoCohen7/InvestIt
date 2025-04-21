import { Card } from 'react-bootstrap'
import SignUpForm from './components/SignUpForm'
import { Link } from 'react-router-dom'
import PageMetaData from '@/components/PageMetaData'
import AuthLayout from '../components/AuthLayout'


const SignUp = () => {
  return (
    <>
      <PageMetaData title='Sign Up' />
      <AuthLayout>
        <Card className="signup-card card-body rounded-3 p-3 p-sm-4 p-md-5 bg-light bg-opacity-75 animate-float">
          <div className="text-center">
            <h1 className="mb-2">Sign up</h1>
            <span className="d-block">
              Already have an account? <Link to="/auth/sign-in">Sign in here</Link>
            </span>
          </div>
          <SignUpForm />
        </Card>
      </AuthLayout>
    </>
  )
}

export default SignUp
