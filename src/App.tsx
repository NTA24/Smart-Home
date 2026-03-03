import { Suspense, lazy, useMemo } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
} from 'react-router-dom'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'

import MainLayout from './layouts/MainLayout'
import DevOnly from './components/DevOnly'
import PageLoading from './components/PageLoading'
import { routes, redirects } from './routes/routeConfig'

const locales = { en: enUS, vi: viVN }

const Home = lazy(() => import('@/pages/Dashboard/Home'))

export default function App() {
  const { i18n } = useTranslation()
  const currentLocale = locales[i18n.language as keyof typeof locales] || enUS

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home/tenant" replace />} />
            <Route path="home" element={<Navigate to="/home/tenant" replace />} />
            <Route
              path="home/tenant"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="home/campus"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="home/building"
              element={
                <Suspense fallback={<PageLoading />}>
                  <Home />
                </Suspense>
              }
            />
            {routes
              .filter((r) => r.path !== 'home')
              .map(({ path, element, devOnly }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <Suspense fallback={<PageLoading />}>
                      {devOnly ? <DevOnly>{element}</DevOnly> : element}
                    </Suspense>
                  }
                />
              ))}
            {redirects.map(({ from, to }) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}
          </Route>
        )
      ),
    []
  )

  return (
    <ConfigProvider
      locale={currentLocale}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}
