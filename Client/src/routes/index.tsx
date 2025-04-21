import { lazy } from 'react'
import { Navigate, type RouteProps } from 'react-router-dom'

//demo pages
const HomeDemo = lazy(() => import('@/app/(social)/feed/(container)/home/page'))
const NewsPage = lazy(() => import('@/app/(social)/(with-topbar)/news/page'))
const GroupsPage = lazy(() => import('@/app/(social)/(with-topbar)/groups/page'))
const SearchPage = lazy(() => import('@/app/(social)/(with-topbar)/search/page'))

//pages
const Messaging = lazy(() => import('@/app/(social)/(with-topbar)/messaging/page'))
const PostDetails = lazy(() => import('@/app/(social)/(with-topbar)/feed/post-details/page'))
import StocksPage from '@/app/(social)/(with-topbar)/stocks/page'

//profile pages
const ProfileFeed = lazy(() => import('@/app/(social)/profile/feed/page'))

//account pages
const AccountSetting = lazy(() => import('@/app/(social)/settings/account/page'))
const NotificationPage = lazy(() => import('@/app/(social)/(with-topbar)/notifications/page'))

//auth routes
const SignIn = lazy(() => import('@/app/(plain)/(authentication)/auth/sign-in/page'))
const SignUp = lazy(() => import('@/app/(plain)/(authentication)/auth/sign-up/page'))
const SignInAdvance = lazy(() => import('@/app/(plain)/(authentication)/auth-advance/sign-in/page'))
const SignUpAdvance = lazy(() => import('@/app/(plain)/(authentication)/auth-advance/sign-up/page'))

const NotFoundPage = lazy(() => import('@/app/(social)/(with-topbar)/not-found/page'))

export type RoutesProps = {
  path: RouteProps['path']
  name: string
  element: RouteProps['element']
  exact?: boolean
}

const initialRoutes: RoutesProps[] = [
  {
    path: '/',
    name: 'root',
    element: <Navigate to="/feed/home" />,
  },
]

// feed with container
const generalRoutes: RoutesProps[] = [
  {
    path: '/feed/home',
    name: 'Demo Home',
    element: <HomeDemo />,
  },
]

export const settingPagesRoutes: RoutesProps[] = [
  {
    path: '/settings/account',
    name: 'Account Settings',
    element: <AccountSetting />,
  },
]

//social pages with topbar
export const socialWithTopbarRoutes: RoutesProps[] = [
  {
    path: '/groups',
    name: 'Groups',
    element: <GroupsPage />,
  },
  {
    path: '/search',
    name: 'Search',
    element: <SearchPage />,
  },
  {
    path: '/messaging',
    name: 'Messaging',
    element: <Messaging />,
  },
  {
    path: '/stocks',
    name: 'Stocks',
    element: <StocksPage />,
  },
  {
    path: '/notifications',
    name: 'Notification',
    element: <NotificationPage />,
  },

  {
    path: '/feed/post-details',
    name: 'Post Details',
    element: <PostDetails />,
  },
  {
    path: '/news',
    name: 'News',
    element: <NewsPage />,
  },
  {
    path: '*',
    name: 'not-found',
    element: <NotFoundPage />,
  },
  {
    path: '/not-found',
    name: 'Not Found',
    element: <NotFoundPage />,
  },
]

export const profilePagesRoutes: RoutesProps[] = [
  {
    path: '/profile/feed/:userId', // תיקון: הוספת '/' לפני :userId
    name: 'Feed',
    element: <ProfileFeed />,
  },
]

export const authRoutes: RoutesProps[] = [
  {
    path: '/auth/sign-in',
    name: 'Sign In',
    element: <SignIn />,
  },
  {
    path: '/auth/sign-up',
    name: 'Sign Up',
    element: <SignUp />,
  },
  {
    path: '/auth-advance/sign-in',
    name: 'Sign In Advance',
    element: <SignInAdvance />,
  },
  {
    path: '/auth-advance/sign-up',
    name: 'Sign Up Advance',
    element: <SignUpAdvance />,
  },
]

export const feedRoutes = [...initialRoutes, ...generalRoutes]
