import { lazy } from 'react'
import type { RouteConfig } from './routeConfig'

const ApiTest = lazy(() => import('@/pages/Test/ApiTest'))
const CampusTest = lazy(() => import('@/pages/Test/CampusTest'))
const BuildingTest = lazy(() => import('@/pages/Test/BuildingTest'))

export const devRoutes: RouteConfig[] = [
  {
    path: 'test-api',
    labelKey: 'menu.apiTest',
    element: <ApiTest />,
  },
  {
    path: 'test-api/campuses/:tenantId',
    labelKey: 'menu.apiTest',
    element: <CampusTest />,
  },
  {
    path: 'test-api/buildings/:campusId',
    labelKey: 'menu.apiTest',
    element: <BuildingTest />,
  },
]

export const devRedirects: Array<{ from: string; to: string }> = [
  { from: 'api-test', to: '/test-api' },
]
