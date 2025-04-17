import PasswordFormInput from '@/components/form/PasswordFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useAuthContext } from '@/context/useAuthContext'

const ChangePassword = () => {
  const [firstPassword, setFirstPassword] = useState<string>('')

  const resetPasswordSchema = yup.object().shape({
    currentPass: yup.string().required('Please enter current Password'),
    newPassword: yup.string().min(8, 'Password must of minimum 8 characters').required('Please enter Password'),
    confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match'),
  })

  const { control, handleSubmit, getValues, watch } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  })

  useEffect(() => {
    setFirstPassword(getValues().newPassword)
  }, [watch('newPassword')])

  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <CardTitle>Change your password</CardTitle>
        <p className="mb-0">See resolved goodness felicity shy civility domestic had but.</p>
      </CardHeader>
      <CardBody>
        <form className="row g-3" onSubmit={handleSubmit(() => {})}>
          <PasswordFormInput name="currentPass" label="Current password" control={control} containerClassName="col-12" />
          <Col xs={12}>
            <PasswordFormInput name="newPassword" label="New password" control={control} />
            <div className="mt-2">
              <PasswordStrengthMeter password={firstPassword} />
            </div>
          </Col>
          <PasswordFormInput name="confirmPassword" label="Confirm password" control={control} containerClassName="col-12" />
          <Col xs={12} className="text-end">
            <Button variant="primary" type="submit" className="mb-0">
              Update password
            </Button>
          </Col>
        </form>
      </CardBody>
    </Card>
  )
}

const AccountSettings = () => {
  const { user } = useAuthContext()

  const createFormSchema = yup.object({
    fName: yup.string().required('Please enter your first name'),
    lName: yup.string().required('Please enter your last name'),
    additionalName: yup.string().required('Please enter additional name'),
    userName: yup.string().required('Please enter your username'),
    phoneNo: yup.string().required('Please enter your phone number'),
    email: yup.string().required('Please enter your email'),
    bio: yup.string().required('Please enter your page description').max(300, 'character limit must be less than 300'),
  })

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(createFormSchema),
    defaultValues: {
      fName: '',
      lName: '',
      email: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        fName: user.firstName || '',
        lName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      })
    }
  }, [user, reset])

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="border-0 pb-0">
          <h1 className="h5 card-title">Account Settings</h1>
          <p className="mb-0">Change your account settings. You can also update your profile information here.</p>
        </CardHeader>
        <CardBody>
          <form className="row g-3" onSubmit={handleSubmit(() => {})}>
            <TextFormInput name="fName" label="First name" control={control} containerClassName="col-sm-6 col-lg-4" />
            <TextFormInput name="lName" label="Last name" control={control} containerClassName="col-sm-6 col-lg-4" />
            <TextFormInput name="email" label="Email" control={control} containerClassName="col-sm-6 col-lg-4" />

            <Col xs={12}>
              <TextAreaFormInput name="bio" label="Bio" rows={4} placeholder="Description (Required)" control={control} />
              <small>Character limit: 300</small>
            </Col>

            <Col xs={12} className="text-end">
              <Button variant="primary" type="submit" size="sm" className="mb-0">
                Save changes
              </Button>
            </Col>
          </form>
        </CardBody>
      </Card>
      <ChangePassword />
    </>
  )
}

export default AccountSettings
