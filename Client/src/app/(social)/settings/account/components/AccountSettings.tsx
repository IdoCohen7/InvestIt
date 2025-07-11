import { useEffect, useState } from 'react'
import PasswordFormInput from '@/components/form/PasswordFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import { API_URL } from '@/utils/env'
import { useAuthFetch } from '@/hooks/useAuthFetch'

const interestOptions = ['Stock Market', 'Crypto', 'Real Estate', 'Savings and Budgeting', 'Pension and Conservative Investments']

const interestMap: { [key: string]: string } = {
  'Stock Market': 'שוק ההון',
  Crypto: 'קריפטו',
  'Real Estate': 'נדל״ן',
  'Savings and Budgeting': 'חיסכון וניהול תקציב',
  'Pension and Conservative Investments': 'פנסיה והשקעות סולידיות',
}

const reverseInterestMap = Object.fromEntries(Object.entries(interestMap).map(([en, he]) => [he, en]))

const ChangePassword = () => {
  const [firstPassword, setFirstPassword] = useState<string>('')
  const { user, removeSession } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const authFetch = useAuthFetch()

  const resetPasswordSchema = yup.object().shape({
    currentPass: yup.string().required('Please enter current Password'),
    newPassword: yup.string().min(8, 'Password must be at least 8 characters').required('Please enter Password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword')], 'Passwords must match')
      .required('Please confirm your password'),
  })

  const { control, handleSubmit, getValues, watch } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  })

  useEffect(() => {
    setFirstPassword(getValues().newPassword)
  }, [watch('newPassword')])

  const onSubmit = async (formData: any) => {
    if (!user) return

    try {
      await authFetch(`${API_URL}/User/ChangePassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          currentPassword: formData.currentPass,
          newPassword: formData.newPassword,
        }),
      })

      showNotification({
        message: 'Password updated successfully, please log in again.',
        variant: 'success',
      })
      removeSession()
    } catch (err) {
      showNotification({
        message: 'Error updating password: ' + (err instanceof Error ? err.message : 'Unknown error'),
        variant: 'danger',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="border-0 pb-0">
        <CardTitle>Change your password</CardTitle>
        <p className="mb-0">Please pick a strong password.</p>
      </CardHeader>
      <CardBody>
        <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
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
  const { user, saveSession } = useAuthContext()
  const { showNotification } = useNotificationContext()
  const [bioLength, setBioLength] = useState<number>(0)
  const [selectedInterest, setSelectedInterest] = useState<string>('')
  const authFetch = useAuthFetch()

  const createFormSchema = yup.object({
    fName: yup.string().required('Please enter your first name'),
    lName: yup.string().required('Please enter your last name'),
    bio: yup.string().required('Please enter your bio').max(150, 'Character limit must be less than 150'),
  })

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: yupResolver(createFormSchema),
    defaultValues: {
      fName: '',
      lName: '',
      bio: '',
    },
  })

  useEffect(() => {
    const subscription = watch((value) => {
      if (value.bio !== undefined) {
        setBioLength(value.bio.length)
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  useEffect(() => {
    if (user) {
      reset({
        fName: user.firstName || '',
        lName: user.lastName || '',
        bio: user.bio || '',
      })

      const englishInterest = reverseInterestMap[user.interestCategory || ''] || ''
      setSelectedInterest(englishInterest)
    }
  }, [user, reset])

  const onSubmit = async (formData: any) => {
    if (!user) return

    const updatedUser = {
      userId: user.userId,
      firstName: formData.fName,
      lastName: formData.lName,
      email: user.email,
      passwordHash: user.passwordHash || '********',
      profilePic: user.profilePic || '',
      bio: formData.bio,
      interestCategory: interestMap[selectedInterest] || '',
      createdAt: user.createdAt,
      isActive: user.isActive,
    }

    try {
      await authFetch(`${API_URL}/User/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      })

      saveSession({ ...updatedUser, token: user.token }, true)

      showNotification({ message: 'User updated successfully!', variant: 'success' })
    } catch (err) {
      console.error('Error updating profile:', err)
      showNotification({ message: 'Error updating profile!', variant: 'danger' })
    }
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="border-0 pb-0">
          <h1 className="h5 card-title">Account Settings</h1>
          <p className="mb-0">Change your account settings. You can also update your profile information here.</p>
        </CardHeader>
        <CardBody>
          <form className="row g-3" onSubmit={handleSubmit(onSubmit)}>
            <TextFormInput name="fName" label="First name" control={control} containerClassName="col-sm-6 col-lg-4" />
            <TextFormInput name="lName" label="Last name" control={control} containerClassName="col-sm-6 col-lg-4" />

            <Col sm={6} lg={4}>
              <label htmlFor="interestCategory" className="form-label">
                Interest Category
              </label>
              <select id="interestCategory" className="form-select" value={selectedInterest} onChange={(e) => setSelectedInterest(e.target.value)}>
                <option value="" disabled>
                  Select category...
                </option>
                {interestOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Col>

            <Col xs={12}>
              <TextAreaFormInput name="bio" label="Bio" rows={4} placeholder="Description (Required)" control={control} />
              <small>Character limit: {bioLength}/150</small>
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
