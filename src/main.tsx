import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './i18n'
import './styles/global.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/pages-vehicle-energy.css'
import './styles/pages-dashboard.css'
import './styles/pages-elevator-robot.css'
import './styles/pages-workspace-admin.css'
import './styles/pages-people.css'
import './styles/responsive.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
