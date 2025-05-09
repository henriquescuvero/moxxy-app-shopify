import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  IndexTable,
  Button,
  Badge,
  Text,
  Box,
  Card,
  LegacyCard,
  EmptyState,
  Tooltip,
  ButtonGroup,
  Icon,
  BlockStack,
  useIndexResourceState // ✅ Polaris hook para seleção
} from "@shopify/polaris";
import { EditIcon, DeleteIcon, PlusIcon } from "@shopify/polaris-icons";
import { useState } from "react";

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
  const { popups } = useLoaderData<typeof loader>();
  const navigate = useNavigate();


  const resourceName = {
    singular: 'popup',
    plural: 'popups',
  };

  // ✅ Polaris hook para gerenciar seleção de recursos
  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
  } = useIndexResourceState(popups);

  const handleToggle = (id: string) => {
    console.log(`Toggling popup ${id}`);
  };

  const handleEdit = (id: string) => {
    console.log(`Editing popup ${id}`);
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting popup ${id}`);
  };

  const handleCreateNew = () => {
    console.log("Criar novo popup");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  const rowMarkup = popups.map(
    ({ id, name, active, createdAt, impressions, conversions }, index) => (
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
          {createdAt ? formatDate(createdAt) : "N/A"}
        </IndexTable.Cell>
        <IndexTable.Cell>
          {impressions?.toLocaleString() || "0"}
        </IndexTable.Cell>
        <IndexTable.Cell>
          <ButtonGroup>
            <Tooltip content="Editar">
              <Button 
                icon={EditIcon} 
                onClick={() => handleEdit(id)}
                accessibilityLabel="Editar popup" 
                variant="tertiary"
              />
            </Tooltip>
            <Tooltip content="Excluir">
              <Button 
                icon={DeleteIcon} 
                onClick={() => handleDelete(id)}
                accessibilityLabel="Excluir popup" 
                variant="tertiary" 
                tone="critical"
              />
            </Tooltip>
          </ButtonGroup>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  const emptyStateMarkup = (
    <EmptyState
      heading="Crie seu primeiro popup"
      action={{
        content: 'Criar popup',
        onAction: handleCreateNew,
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Crie popups para aumentar suas conversões e engajamento</p>
    </EmptyState>
  );

  return (
    <Page
      title="Pop-ups"
      primaryAction={{
        content: "Criar popup",
        icon: PlusIcon,
        onAction: handleCreateNew,
      }}
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Gerencie seus popups
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Use popups para aumentar suas vendas, capturar leads e melhorar a experiência do cliente.
            </Text>
          </BlockStack>
        </Card>

        <LegacyCard>
          <IndexTable
            resourceName={resourceName}
            itemCount={popups.length}
            selectedItemsCount={selectedResources.length}
            onSelectionChange={handleSelectionChange}
            selectable
            bulkActions={bulkActions}
            emptyState={emptyStateMarkup}
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
        </LegacyCard>
      </BlockStack>
    </Page>
  );
}
