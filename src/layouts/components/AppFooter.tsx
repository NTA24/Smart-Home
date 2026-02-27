import { Layout } from 'antd'
import { useTranslation } from 'react-i18next'
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
} from '@ant-design/icons'
import viettelLogo from '@/assets/viettel-logo.png'
import newgenLogo from '@/assets/newgen-logo.png'

const { Footer } = Layout

interface AppFooterProps {
  useNewgenLogo: boolean
  onLogoClick: () => void
}

export default function AppFooter({ useNewgenLogo, onLogoClick }: AppFooterProps) {
  const { t } = useTranslation()
  const currentLogo = useNewgenLogo ? newgenLogo : viettelLogo

  return (
    <Footer className="main-footer">
      <div className="footer_grid">
        {/* Company info */}
        <div className="footer_col--wide">
          <div className="footer_logo" onClick={onLogoClick} title="Click to switch logo">
            <img src={currentLogo} alt={useNewgenLogo ? 'Newgen Logo' : 'Viettel Logo'} />
          </div>
          <p className="footer_text--name">Newgen Smart Home Solutions</p>
          <p className="footer_text--desc">
            {t('footer.companyDesc', 'Leading provider of smart home and building management solutions in Vietnam. We deliver innovative IoT technologies for modern living and sustainable energy management.')}
          </p>
        </div>

        {/* Contact info */}
        <div className="footer_col--contact">
          <h3 className="footer_heading">{t('footer.contactInfo', 'Contact Information')}</h3>
          <div className="footer_contact-list">
            <div className="footer_contact-item footer_contact-item--top">
              <EnvironmentOutlined className="footer_contact-icon footer_contact-icon--top" />
              <span className="footer_text">
                {t('footer.address', 'Viettel Tower, 285 Cach Mang Thang 8 Street, Ward 12, District 10, Ho Chi Minh City, Vietnam')}
              </span>
            </div>
            <div className="footer_contact-item">
              <PhoneOutlined className="footer_contact-icon" />
              <span className="footer_text">+84 (024) 123456789</span>
            </div>
            <div className="footer_contact-item">
              <MailOutlined className="footer_contact-icon" />
              <span className="footer_text">contact@newgen.vn</span>
            </div>
            <div className="footer_contact-item">
              <GlobalOutlined className="footer_contact-icon" />
              <span className="footer_text">www.newgen.vn</span>
            </div>
          </div>
        </div>

        {/* Working hours */}
        <div className="footer_col">
          <h3 className="footer_heading">{t('footer.workingHours', 'Working Hours')}</h3>
          <div className="footer_hours-list">
            <div className="footer_hours-row">
              <span className="footer_text">{t('footer.mondayFriday', 'Monday - Friday')}:</span>
              <span className="footer_text--white">8:00 - 17:30</span>
            </div>
            <div className="footer_hours-row">
              <span className="footer_text">{t('footer.saturday', 'Saturday')}:</span>
              <span className="footer_text--white">8:00 - 12:00</span>
            </div>
            <div className="footer_hours-row">
              <span className="footer_text">{t('footer.sunday', 'Sunday')}:</span>
              <span style={{ color: '#ff6b6b', fontSize: 12 }}>{t('footer.closed', 'Closed')}</span>
            </div>
            <div className="footer_support-box">
              <span className="footer_support-text">
                🔧 {t('footer.support247', '24/7 Technical Support Hotline')}: 1800 8098
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer_copyright">
        <p className="footer_copyright-text">
          © 2026 Newgen Smart Home Solutions. All rights reserved.
        </p>
      </div>
    </Footer>
  )
}
