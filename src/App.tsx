import { lazy, Suspense } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
  Navigate,
} from 'react-router'
import { ConfigProvider } from 'antd'
import enUS from 'antd/locale/en_US'
import viVN from 'antd/locale/vi_VN'
import { useTranslation } from 'react-i18next'

import AuthNavigationRoot from './layouts/AuthNavigationRoot'
import MainLayout from './layouts/MainLayout'
import PageLoading from './components/PageLoading'
import { routes, redirects, DEFAULT_HOME_PATH } from './routes/routeConfig'

const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))

const locales = { en: enUS, vi: viVN }

function shouldCreateSystemAlias(path: string): boolean {
  return (
    !path.startsWith('system/') &&
    !path.startsWith('operations/') &&
    !path.startsWith('governance/') &&
    !path.startsWith('home/') &&
    !path.startsWith('account-settings/') &&
    path !== 'account-settings' &&
    path !== 'user-management' &&
    !path.startsWith('test-api')
  )
}

const allRenderableRoutes = [
  ...routes,
  ...routes
    .filter((r) => shouldCreateSystemAlias(r.path))
    .map((r) => ({ ...r, path: `system/${r.path}` })),
]

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AuthNavigationRoot />}>
      <Route
        path="login"
        element={
          <Suspense fallback={<PageLoading />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to={DEFAULT_HOME_PATH} replace />} />
        {allRenderableRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <Suspense fallback={<PageLoading />}>
                {element}
              </Suspense>
            }
          />
        ))}
        {redirects.map(({ from, to }) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
      </Route>
    </Route>
  )
)

export default function App() {
  const { i18n } = useTranslation()
  const currentLocale = locales[i18n.language as keyof typeof locales] || enUS

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
