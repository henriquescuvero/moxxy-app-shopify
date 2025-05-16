import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Index, { loader } from './app._index'; // Ajuste o caminho conforme necessário
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { vi } from 'vitest';

// Mock do useAppBridge para evitar erros relacionados ao contexto do Shopify App Bridge
vi.mock('@shopify/app-bridge-react', async () => {
  const actual = await vi.importActual('@shopify/app-bridge-react');
  return {
    ...actual,
    useAppBridge: () => ({
      // Mock das funções do appBridge que seu componente possa usar
      // Por exemplo, se usar shopify.features.getState('idToken'), mocke features
      features: {
        getState: vi.fn().mockResolvedValue('mocked-id-token'), // Exemplo
      },
      // Adicione outros mocks de funções do appBridge conforme necessário
    }),
  };
});

// Mock do useLoaderData para fornecer dados simulados ao componente
vi.mock('@remix-run/react', async () => {
  const actual = await vi.importActual('@remix-run/react');
  return {
    ...actual,
    useLoaderData: () => ({
      activePopups: 5,
      totalViews: 1250,
      totalClicks: 300,
    }),
  };
});

describe('Index page', () => {
  it('renders the main title', async () => {
    // Renderiza o componente dentro de um BrowserRouter, pois ele pode conter Links
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );

    // Verifica se o TitleBar está presente com o título correto
    // Como TitleBar é um componente que não renderiza texto diretamente no DOM visível pelo screen.getByText,
    // e seu título é passado como prop, a melhor forma de testá-lo seria através de um mock
    // ou verificando se o componente que usa TitleBar (neste caso, Index) o chama com a prop correta.
    // No entanto, para um teste simples, podemos verificar um texto que DEVE estar na página.

    // Exemplo de verificação de um texto que se espera estar na página:
    expect(screen.getByText('Estatísticas dos Pop-ups')).toBeInTheDocument();

    // Para testar o TitleBar mais diretamente, precisaríamos de um setup mais complexo
    // ou de uma forma de inspecionar as props passadas para ele.
    // Por agora, vamos focar em testar o conteúdo renderizado pelo componente Index.
  });

  it('displays the correct metrics from loaderData', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pop-ups Ativos')).toBeInTheDocument();
    expect(screen.getByText('1250')).toBeInTheDocument();
    expect(screen.getByText('Visualizações')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('Cliques')).toBeInTheDocument();
  });

  // Teste para a função loader (exemplo básico)
  // Note: Testar loaders do Remix pode ser mais complexo e exigir mocks do ambiente do servidor Remix.
  // Este é um exemplo simplificado.
  it('loader returns mock data', async () => {
    const request = new Request('http://localhost:3000/app'); // Mock de um objeto Request
    // Mock da função authenticate.admin para evitar erros
    const mockAuthenticate = {
      admin: vi.fn().mockResolvedValue({ session: { shop: 'test-shop.myshopify.com' } }),
    };
    vi.mock('../shopify.server', () => ({
      authenticate: mockAuthenticate,
    }));

    const data = await loader({ request, params: {}, context: {} as any });
    expect(data.activePopups).toBe(5);
    expect(data.totalViews).toBe(1250);
    expect(data.totalClicks).toBe(300);
  });
});