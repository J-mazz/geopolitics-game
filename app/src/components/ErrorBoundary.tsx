import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, color: '#ccc', fontFamily: 'system-ui' }}>
          <h2 style={{ color: '#ff6666' }}>Something went wrong.</h2>
          <p style={{ color: '#888' }}>{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: undefined })}
            style={{ marginTop: 12, padding: '6px 14px', borderRadius: 6, border: '1px solid #444', background: '#1a1a2a', color: '#ccc', cursor: 'pointer' }}
          >Retry</button>
        </div>
      )
    }
    return this.props.children
  }
}
