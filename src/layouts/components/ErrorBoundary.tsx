import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Button, Result } from 'antd'

interface Props {
  children: ReactNode
  /** Tên trang/module — hiện trong error message để dễ debug */
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Bắt runtime errors trong cây component con, tránh white screen toàn app.
 *
 * Dùng trong App.tsx bọc mỗi route:
 *   <ErrorBoundary name="Camera Live View">
 *     <CameraLiveView />
 *   </ErrorBoundary>
 *
 * Hoặc bọc ở cấp route group trong MainLayout nếu muốn coarse-grained.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Ghi log để debug — sau này thay bằng Sentry / DataDog
    console.error(`[ErrorBoundary${this.props.name ? ` • ${this.props.name}` : ''}]`, error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const isDev = import.meta.env.DEV

    return (
      <Result
        status="error"
        title="Trang này gặp lỗi"
        subTitle={
          <>
            {this.props.name && (
              <div style={{ marginBottom: 8, fontWeight: 500 }}>{this.props.name}</div>
            )}
            {/* Chỉ hiện error message chi tiết trong DEV */}
            {isDev && this.state.error && (
              <pre
                style={{
                  textAlign: 'left',
                  background: '#fff1f0',
                  border: '1px solid #ffccc7',
                  borderRadius: 6,
                  padding: '12px 16px',
                  fontSize: 12,
                  overflowX: 'auto',
                  maxHeight: 200,
                  marginTop: 12,
                }}
              >
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            )}
          </>
        }
        extra={[
          <Button type="primary" key="retry" onClick={this.handleReset}>
            Thử lại
          </Button>,
          <Button key="home" onClick={() => { this.handleReset(); window.location.href = '/dashboard' }}>
            Về Dashboard
          </Button>,
        ]}
      />
    )
  }
}
