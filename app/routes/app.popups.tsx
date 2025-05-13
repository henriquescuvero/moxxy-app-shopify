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
  Banner,
  LegacyCard,
  EmptyState,
  Tooltip,
  ButtonGroup,
  BlockStack,
  useIndexResourceState,
  Popover,
  ActionList,
  TextField, // ✅ Adicionar TextField
} from "@shopify/polaris";
import { EditIcon, DeleteIcon, PlusIcon, SortAscendingIcon, SortDescendingIcon, MenuHorizontalIcon } from "@shopify/polaris-icons";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useState, useCallback, useMemo } from "react";

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
  await authenticate.admin(request);

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

  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // ✅ Estado para a busca

  const togglePopover = useCallback((id: string) => {
    setActivePopoverId(prevId => (prevId === id ? null : id));
  }, []);

  const handleSearchChange = useCallback((value: string) => { // ✅ Handler para a busca
    setSearchQuery(value);
  }, []);

  // ✅ Filtrar popups com base na searchQuery
  const filteredPopups = useMemo(() => {
    if (!searchQuery) {
      return initialPopups;
    }
    return initialPopups.filter(popup =>
      popup.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [initialPopups, searchQuery]);


  const resourceName = {
    singular: 'popup',
    plural: 'popups',
  };

  // ✅ Usar filteredPopups para useIndexResourceState para que a seleção reflita os itens filtrados
  const {
    selectedResources,
    allResourcesSelected, // Adicionado para consistência, embora não usado diretamente no seu bulkAction atual
    handleSelectionChange,
  } = useIndexResourceState(filteredPopups.map(popup => ({...popup, id: popup.id.toString()})));

  const [sortColumn, setSortColumn] = useState<keyof Popup | undefined>('name');
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>('ascending');

  const handleSort = useCallback(
    (index: number, direction: 'ascending' | 'descending') => {
      const headingKeys: (keyof Popup)[] = ['name', 'active', 'createdAt', 'impressions'];
      setSortColumn(headingKeys[index]);
      setSortDirection(direction);
    },
    [],
  );

  // ✅ Usar filteredPopups como base para a ordenação
  const sortedPopups = useMemo(() => {
    if (!sortColumn) return filteredPopups;

    return [...filteredPopups].sort((a, b) => {
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
  }, [filteredPopups, sortColumn, sortDirection]);

  const handleEdit = (id: string) => {
    console.log(`Editing popup ${id}`);
    navigate(`/app/popups/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting popup ${id}`);
    // Lógica de deleção
  };

  const handleCreateNew = () => {
    console.log("Criar novo popup");
    navigate("/app/popups/new");
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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

  const rowMarkup = sortedPopups.map(
    ({ id, name, active, createdAt, impressions }, index) => {
      const popoverActions = [
        {
          content: 'Editar',
          onAction: () => {
            handleEdit(id);
            setActivePopoverId(null);
          },
        },
        {
          content: 'Excluir',
          destructive: true,
          onAction: () => {
            handleDelete(id);
            setActivePopoverId(null);
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
            {impressions !== undefined && impressions !== null ? impressions.toLocaleString('pt-BR') : "0"}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Popover
              active={activePopoverId === id}
              activator={(
                <Button
                  onClick={() => togglePopover(id)}
                  icon={MenuHorizontalIcon}
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
      heading={searchQuery ? "Nenhum popup encontrado" : "Crie seu primeiro popup"}
      action={!searchQuery ? { // Só mostra ação de criar se não estiver buscando
        content: 'Criar popup',
        onAction: handleCreateNew,
      } : undefined}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>{searchQuery ? `Tente uma busca diferente ou limpe o campo de busca.` : `Crie popups para aumentar suas conversões e engajamento`}</p>
    </EmptyState>
  );

  return (
    <Page>
      <TitleBar title="Moxxy App - Pop-ups">
        <button onClick={handleCreateNew} className="Polaris-Button Polaris-Button--primary"> {/* Usar classes do Polaris para o botão do TitleBar */}
          + Criar Popup
        </button>
      </TitleBar>

      <BlockStack gap="400">
        <Banner
          title="Gerencie seus Pop-ups"
          tone="info"
        >
          <p>
            Use pop-ups para aumentar suas vendas, capturar leads e melhorar a experiência do cliente.
          </p>
        </Banner>

        <LegacyCard>
          {/* ✅ Adicionar o campo de busca */}
          <LegacyCard.Section>
            <TextField
                label="Buscar popups"
                labelHidden
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
                placeholder="Buscar por nome do popup"
            />
          </LegacyCard.Section>

          <IndexTable
            resourceName={resourceName}
            itemCount={sortedPopups.length}
            selectedItemsCount={selectedResources.length}
            onSelectionChange={handleSelectionChange}
            selectable
            bulkActions={sortedPopups.length > 0 ? bulkActions : undefined}
            emptyState={emptyStateMarkup} // ✅ O emptyState agora é condicional e renderizado aqui
            sortable={[true, true, true, true, false]}
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
          {/* A condicional para o EmptyState foi movida para a prop `emptyState` da IndexTable,
              mas se precisar de um EmptyState fora da tabela quando não há itens E não há busca,
              pode adicionar aqui. No entanto, o `emptyState` da `IndexTable` é geralmente preferido.
          */}
        </LegacyCard>
      </BlockStack>
    </Page>
  );
}