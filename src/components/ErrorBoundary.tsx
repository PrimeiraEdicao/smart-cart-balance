import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o estado para que a próxima renderização mostre a UI de fallback.
    return { hasError: true, error: error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Você também pode logar o erro para um serviço de relatórios de erro
    console.error("Erro não capturado:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // Renderiza uma UI de fallback
      return (
        <div style={{ padding: '2rem', margin: '1rem', border: '2px dashed red', background: '#fff0f0' }}>
          <h1 style={{ fontSize: '1.5rem', color: '#cc0000', marginBottom: '1rem' }}>Algo deu errado na página da lista.</h1>
          <p>Houve um erro ao tentar renderizar esta parte do aplicativo. Abaixo estão os detalhes do erro:</p>
          <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: '1rem' }}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;