import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  IndexTable,
  Button,
  Badge,
  Text,
  Card,
  LegacyCard,
  EmptyState,
  Tooltip,
  ButtonGroup,
  BlockStack,
  useIndexResourceState,
  Popover, // Adicionar Popover
  ActionList, // Adicionar ActionList
} from "@shopify/polaris";
// Tente MenuHorizontalIcon ou verifique a documentação do Polaris para o ícone correto
import { EditIcon, DeleteIcon, PlusIcon, SortAscendingIcon, SortDescendingIcon, MenuHorizontalIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react"; // ✅ Importar TitleBar do App Bridge
import { authenticate } from "../shopify.server"; // ✅ Importar authenticate
import { useState, useCallback, useMemo } from "react"; // ✅ Importar useState, useCallback e useMemo

// Tipos para o nosso modelo de dados
interface Popup {
  id: string;
  name: string;
  active: boolean;
  createdAt?: string;
  impressions?: number;
  conversions?: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request); // ✅ Autenticar a requisição

  // No futuro, você buscaria os popups do banco de dados ou de Metaobjects aqui
  const popups: Popup[] = [
    {
      id: "1",
      name: "Promoção de Verão",
      active: true,
      createdAt: "2024-05-01",
      impressions: 1250,
    },
    {
      id: "2",
      name: "Black Friday",
      active: false,
      createdAt: "2024-03-15",
      impressions: 3200,
    },
    {
      id: "3",
      name: "Natal 2024",
      active: true,
      createdAt: "2024-04-20",
      impressions: 980,
    }
  ];

  return json({ popups });
};

export default function PopupsPage() {
  const { popups: initialPopups } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Estado para controlar qual popover está ativo
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

  const togglePopover = useCallback((id: string) => {
    setActivePopoverId(prevId => (prevId === id ? null : id));
  }, []);

  // const shopify = useAppBridge(); // Descomente se precisar do App Bridge para outras coisas (toast, etc.)

  const resourceName = {
    singular: 'popup',
    plural: 'popups',
  };

  const {
    selectedResources,
    handleSelectionChange,
  } = useIndexResourceState(initialPopups.map(popup => ({...popup, id: popup.id.toString()})));

  // Estado para ordenação
  const [sortColumn, setSortColumn] = useState<keyof Popup | undefined>('name');
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending');

  const handleSort = useCallback(
    (index: number, direction: 'ascending' | 'descending') => {
      const headingKeys: (keyof Popup)[] = ['name', 'active', 'createdAt', 'impressions']; // Mapeia o índice do cabeçalho para a chave do popup
      setSortColumn(headingKeys[index]);
      setSortDirection(direction);
    },
    [],
  );

  const sortedPopups = useMemo(() => {
    if (!sortColumn) return initialPopups;

    return [...initialPopups].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === 'ascending' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'ascending' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'ascending' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'ascending' ? (aValue === bValue ? 0 : aValue ? -1 : 1) : (aValue === bValue ? 0 : aValue ? 1 : -1);
      }
      // Para datas (createdAt), comparamos como strings por enquanto, mas o ideal seria converter para Date objects
      if (sortColumn === 'createdAt') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return sortDirection === 'ascending' ? 1 : -1;
        if (isNaN(dateB)) return sortDirection === 'ascending' ? -1 : 1;
        return sortDirection === 'ascending' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });
  }, [initialPopups, sortColumn, sortDirection]);

  const handleEdit = (id: string) => {
    console.log(`Editing popup ${id}`);
    navigate(`/app/popups/${id}/edit`); // Exemplo de navegação real
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting popup ${id}`);
    // Lógica de deleção (ex: usar fetcher.submit com method DELETE)
  };

  const handleCreateNew = () => {
    console.log("Criar novo popup");
    navigate("/app/popups/new"); // Exemplo de navegação real
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    // Adiciona tratamento de erro básico para datas inválidas
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Data inválida";
    }
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); // Adicionar timeZone pode evitar problemas de off-by-one
  };

  const bulkActions = [
    {
      content: 'Ativar selecionados',
      onAction: () => console.log('Ativando', selectedResources),
    },
    {
      content: 'Desativar selecionados',
      onAction: () => console.log('Desativando', selectedResources),
    },
    {
      destructive: true,
      content: 'Deletar selecionados',
      onAction: () => console.log('Deletando', selectedResources),
    },
  ];

  const rowMarkup = sortedPopups.map( // Usar sortedPopups aqui
    ({ id, name, active, createdAt, impressions }, index) => {
      const popoverActions = [
        {
          content: 'Editar',
          onAction: () => {
            handleEdit(id);
            setActivePopoverId(null); // Fechar popover após ação
          },
        },
        {
          content: 'Excluir',
          destructive: true,
          onAction: () => {
            handleDelete(id);
            setActivePopoverId(null); // Fechar popover após ação
          },
        },
      ];

      return (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>
            <Text as="span" variant="bodyMd" fontWeight="bold">
              {name}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={active ? "success" : "critical"}>
              {active ? "Ativo" : "Inativo"}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {formatDate(createdAt)}
          </IndexTable.Cell>
          <IndexTable.Cell>
            {impressions?.toLocaleString() ?? "0"}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Popover
              active={activePopoverId === id}
              activator={(
                <Button
                  onClick={() => togglePopover(id)}
                  icon={MenuHorizontalIcon} // Ícone corrigido aqui
                  accessibilityLabel="Ações do popup"
                  variant="tertiary"
                />
              )}
              onClose={() => setActivePopoverId(null)}
            >
              <ActionList
                actionRole="menuitem"
                items={popoverActions}
              />
            </Popover>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    },
  );

  const emptyStateMarkup = (
    <EmptyState
      heading="Crie seu primeiro popup"
      action={{
        content: 'Criar popup',
        onAction: handleCreateNew,
        // Ícone não é diretamente suportado pela ação do EmptyState aqui,
        // mas o botão principal do TitleBar terá o texto.
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Crie popups para aumentar suas conversões e engajamento</p>
    </EmptyState>
  );

  return (
    // ✅ Remover title e primaryAction daqui
    <Page>
      {/* ✅ Adicionar TitleBar e mover a ação primária para cá */}
      <TitleBar title="Moxxy App - Pop-ups">
        <button onClick={handleCreateNew} className="Polaris-Button Polaris-Button--primary"> {/* Adicionado classes Polaris para estilização */}
            Criar popup
        </button>
        {/* Alternativamente, usando a prop primaryAction do TitleBar:
        <TitleBar
            title="Pop-ups"
            primaryAction={{
                content: "Criar popup",
                onAction: handleCreateNew,
            }}
        >
        </TitleBar>
        Note que o botão pode ter um estilo ligeiramente diferente dependendo do método.
        Usar um <button> filho direto como no exemplo Index funciona bem.
        */}
      </TitleBar>

      <BlockStack gap="400">
        {/* O Card informativo pode ser opcional se o TitleBar já explica a página */}
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Gerencie seus Pop-ups
            </Text>            <Text as="p" variant="bodyMd" tone="subdued">
              Use pop-ups para aumentar suas vendas, capturar leads e melhorar a experiência do cliente.
            </Text>
          </BlockStack>
        </Card>

        <LegacyCard>
          <IndexTable
            resourceName={resourceName}
            itemCount={sortedPopups.length} // Usar sortedPopups aqui
            selectedItemsCount={selectedResources.length}
            onSelectionChange={handleSelectionChange}
            selectable
            bulkActions={sortedPopups.length > 0 ? bulkActions : undefined} // Usar sortedPopups aqui
            emptyState={sortedPopups.length === 0 ? emptyStateMarkup : undefined} // Usar sortedPopups aqui
            sortable={[true, true, true, true, false]} // Definir quais colunas são ordenáveis
            sortColumnIndex={sortColumn ? ['name', 'active', 'createdAt', 'impressions'].indexOf(sortColumn) : undefined}
            sortDirection={sortDirection}
            onSort={handleSort}
            headings={[
              { title: 'Nome', id: 'name' },
              { title: 'Status', id: 'status' },
              { title: 'Data de Criação', id: 'createdAt' },
              { title: 'Impressões', id: 'impressions' },
              { title: 'Ações', id: 'actions' },
            ]}
          >
            {rowMarkup}
          </IndexTable>
          {/* Condicional para mostrar EmptyState fora da tabela se não houver itens */}
            {sortedPopups.length === 0 && ( // Usar sortedPopups aqui
              <Card> {/* Envolver EmptyState em Card para padding */}
                {emptyStateMarkup}
              </Card>
            )}
        </LegacyCard>
      </BlockStack>
    </Page>
  );
}