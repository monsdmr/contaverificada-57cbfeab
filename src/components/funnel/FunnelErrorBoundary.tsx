import { Component, ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class FunnelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[FunnelErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-gray-800 text-lg font-bold mb-2">Algo deu errado</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Ocorreu um erro inesperado. Tente novamente ou recarregue a página.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FunnelErrorBoundary;
