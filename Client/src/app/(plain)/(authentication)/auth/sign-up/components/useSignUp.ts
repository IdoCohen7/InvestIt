import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { useAuthContext } from '@/context/useAuthContext'
import { useNotificationContext } from '@/context/useNotificationContext'
import type { UserType } from '@/types/auth'

const useSignUp = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const { saveSession } = useAuthContext()
  const { showNotification } = useNotificationContext()

  const signUpSchema = yup.object({
    firstName: yup.string().required('Please enter your first name'),
    lastName: yup.string().required('Please enter your last name'),
    email: yup.string().email('Please enter a valid email').required('Please enter your email'),
    password: yup.string().required('Please enter your password'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
  })

  const { control, handleSubmit, register, getValues } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  type SignUpFormFields = yup.InferType<typeof signUpSchema>

  const signUp = handleSubmit(async (values: SignUpFormFields) => {
    try {
      setLoading(true)

      const res = await fetch('https://localhost:7204/api/User', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 0,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          passwordHash: values.password,
          profilePic: '',
          experienceLevel: '',
          bio: '',
          createdAt: new Date().toLocaleDateString('en-GB'), // "14/04/2025"
          isActive: true,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`)
      }

      const data: UserType = await res.json()
      saveSession(data, false)

      showNotification({ message: 'Registration successful. Redirecting...', variant: 'success' })
      navigate('/')
    } catch (e) {
      console.error('Signup error:', e)
      showNotification({ message: 'Signup failed. Please try again.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  })

  return { loading, signUp, control, register, getValues }
}

export default useSignUp
