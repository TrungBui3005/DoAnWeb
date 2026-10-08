import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="error-boundary">
          <div className="error-boundary-card">
            <span><AlertTriangle size={28} /></span>
            <h1>Đã xảy ra lỗi khi tải ứng dụng</h1>
            <p>Đây có thể là lỗi kết nối hoặc một phần giao diện chưa được tải đầy đủ.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Thử lại
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
