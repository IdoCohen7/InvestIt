import { Navigate, Route, Routes, type RouteProps } from 'react-router-dom'
import { Suspense } from 'react'

import OtherLayout from '@/layouts/OtherLayout'
import { useAuthContext } from '@/context/useAuthContext'
import { authRoutes, feedRoutes, profilePagesRoutes, settingPagesRoutes, socialWithTopbarRoutes } from '@/routes/index'
import FeedLayout from '@/layouts/FeedLayout'
import SocialLayout from '@/layouts/SocialLayout'
import SettingLayout from '@/layouts/SettingLayout'

const AppRouter = (props: RouteProps) => {
  const { isAuthenticated } = useAuthContext()

  return (
    <Suspense fallback={<div className="text-center mt-5">Loading...</div>}>
      <Routes>
        {(authRoutes || []).map((route, idx) => (
          <Route key={route.name} path={route.path} element={<OtherLayout {...props}>{route.element}</OtherLayout>} />
        ))}

        {(feedRoutes || []).map((route, idx) => (
          <Route
            key={route.name}
            path={route.path}
            element={
              isAuthenticated ? (
                <FeedLayout {...props}>{route.element}</FeedLayout>
              ) : (
                <Navigate to={{ pathname: '/auth/sign-in', search: 'redirectTo=' + route.path }} />
              )
            }
          />
        ))}

        {(socialWithTopbarRoutes || []).map((route, idx) => (
          <Route
            key={route.name}
            path={route.path}
            element={
              isAuthenticated ? (
                <SocialLayout {...props}>{route.element}</SocialLayout>
              ) : (
                <Navigate to={{ pathname: '/auth/sign-in', search: 'redirectTo=' + route.path }} />
              )
            }
          />
        ))}

        {(profilePagesRoutes || []).map((route, idx) => (
          <Route
            key={route.name}
            path={route.path}
            element={isAuthenticated ? route.element : <Navigate to={{ pathname: '/auth/sign-in', search: 'redirectTo=' + route.path }} />}
          />
        ))}

        {(settingPagesRoutes || []).map((route, idx) => (
          <Route
            key={route.name}
            path={route.path}
            element={
              isAuthenticated ? (
                <SettingLayout {...props}>{route.element}</SettingLayout>
              ) : (
                <Navigate to={{ pathname: '/auth/sign-in', search: 'redirectTo=' + route.path }} />
              )
            }
          />
        ))}
      </Routes>
    </Suspense>
  )
}

export default AppRouter
