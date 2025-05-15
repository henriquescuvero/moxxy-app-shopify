import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  BlockStack,
  Text,
  Select,
  PageActions,
  Banner,
  Button, // Importado para o botão de submit explícito
  Box, // Adicionado para o container do iframe
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";
import {
  useNavigate,
  Form as RemixForm,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"; // ActionFunctionArgs importado

// Tipagem para os erros que a action pode retornar
interface ActionErrors {
  popupName?: string;
  popupTitle?: string;
  popupText?: string;
  buttonText?: string;
  showAfter?: string;
  reopenAfter?: string;
  showOnlyNewUsers?: string;
  showOnPages?: string;
  specificPages?: string;
}

// Tipagem para a resposta completa da action
interface ActionResponse {
  errors?: ActionErrors;
  // Você pode adicionar outros campos se a action retornar dados em sucesso
  // successMessage?: string;
}

// Action function do Remix para processar o formulário
export async function action({ request }: ActionFunctionArgs) { // request tipado
  const formData = await request.formData();

  const popupName = formData.get("popupName") as string | null;
  const popupTitle = formData.get("popupTitle") as string | null;
  const popupText = formData.get("popupText") as string | null;
  const buttonText = formData.get("buttonText") as string | null;
  const showAfter = formData.get("showAfter") as string | null;
  const reopenAfter = formData.get("reopenAfter") as string | null;
  const showOnlyNewUsers = formData.get("showOnlyNewUsers") === 'true';
  const showOnPages = formData.get("showOnPages") as string | null;
  const specificPages = formData.get("specificPages") as string | null;

  const errors: ActionErrors = {};
  if (!popupName) errors.popupName = "Nome do Pop-up é obrigatório";
  if (!popupTitle) errors.popupTitle = "Título do Pop-up é obrigatório";
  // Adicione mais validações conforme necessário

  if (Object.keys(errors).length > 0) {
    return json<ActionResponse>({ errors }, { status: 400 });
  }

  console.log("Salvando popup via Action:", {
    popupName,
    popupTitle,
    popupText,
    buttonText,
    showAfter,
    reopenAfter,
    showOnlyNewUsers,
    showOnPages,
    specificPages,
  });

  await new Promise(res => setTimeout(res, 1000));

  return redirect("/app/popups");
}

export default function NewPopupPage() {
  const navigate = useNavigate();
  // useActionData tipado com ActionResponse
  const actionData = useActionData<ActionResponse>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  const [popupName, setPopupName] = useState('');
  const [popupTitle, setPopupTitle] = useState('');
  const [popupText, setPopupText] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [showAfter, setShowAfter] = useState('0');
  const [reopenAfter, setReopenAfter] = useState('1');
  const [showOnlyNewUsers, setShowOnlyNewUsers] = useState(false);
  const [showOnPages, setShowOnPages] = useState('all');
  const [specificPages, setSpecificPages] = useState('');

  const pageOptions = [
    { label: 'Todas as páginas', value: 'all' },
    { label: 'Páginas específicas', value: 'specific' },
  ];

  // HTML do modal para o preview
  const modalHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Modal Preview</title>
      <style>
        body, html { margin: 0; padding: 0; height: 100%; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; background: transparent; }
        .modal-content-preview {
          position: relative; background: white; padding: 20px 30px; border-radius: 8px;
          max-width: 300px; /* Ajustado para caber melhor no preview */
          text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          border: 1px solid #dfe3e8; /* Adiciona uma borda sutil */
        }
        .modal-content-preview h2 { margin-top: 0; margin-bottom: 10px; font-size: 18px; }
        .modal-content-preview p { margin-bottom: 15px; font-size: 14px; color: #333; }
        .modal-content-preview button.action-button { padding: 8px 20px; background-color: #007BFF; border: none; border-radius: 5px; color: white; font-size: 14px; cursor: default; }
        .close-btn-preview { position: absolute; top: 8px; right: 8px; background: transparent; border: none; font-size: 16px; font-weight: bold; cursor: default; color: #555; }
        .close-btn-preview:hover { color: #000; }
      </style>
    </head>
    <body>
      <div class="modal-content-preview">
        <button class="close-btn-preview" aria-label="Fechar modal">×</button>
        <h2>${popupTitle || 'Título do Pop-up'}</h2>
        <p>${popupText || 'Texto do Pop-up'}</p>
        <button class="action-button">${buttonText || 'Texto do Botão'}</button>
      </div>
    </body>
    </html>
  `;

  return (
    <Page>
      <TitleBar title="Moxxy App - Criar Novo Pop-up" />
      <RemixForm method="post">
        <Layout>
          <Layout.Section> {/* Esta será a coluna principal (aproximadamente dois terços) */}
            <BlockStack gap="500">
              <Banner title="Configuração de Comportamento" tone="info">
                <p>Defina como e quando seu pop-up será exibido aos visitantes.</p>
              </Banner>
              <Card>
                <FormLayout>
                  <TextField
                    label="Nome do Pop-up"
                    name="popupName"
                    value={popupName}
                    onChange={setPopupName}
                    autoComplete="off"
                    helpText="Este nome é para sua referência interna."
                    error={actionData?.errors?.popupName}
                  />
                  <TextField
                    label="Título do Pop-up"
                    name="popupTitle"
                    value={popupTitle}
                    onChange={setPopupTitle}
                    autoComplete="off"
                    helpText="O título que será exibido no pop-up."
                    error={actionData?.errors?.popupTitle}
                  />
                  <TextField
                    label="Texto do Pop-up"
                    name="popupText"
                    value={popupText}
                    onChange={setPopupText}
                    autoComplete="off"
                    multiline={3}
                    helpText="O conteúdo principal do seu pop-up."
                    error={actionData?.errors?.popupText}
                  />
                  <TextField
                    label="Texto do Botão"
                    name="buttonText"
                    value={buttonText}
                    onChange={setButtonText}
                    autoComplete="off"
                    helpText="O texto para o botão de ação (ex: 'Saiba Mais', 'Comprar Agora')."
                    error={actionData?.errors?.buttonText}
                  />

                  <Text variant="headingMd" as="h2">Configurações de Exibição</Text>

                  <TextField
                    label="Mostrar Pop-up Após (segundos)"
                    name="showAfter"
                    type="number"
                    value={showAfter}
                    onChange={setShowAfter}
                    autoComplete="off"
                    helpText="Tempo em segundos antes do pop-up aparecer após o carregamento da página."
                    error={actionData?.errors?.showAfter}
                  />
                  <TextField
                    label="Reabrir Pop-up Após (dias)"
                    name="reopenAfter"
                    type="number"
                    value={reopenAfter}
                    onChange={setReopenAfter}
                    autoComplete="off"
                    helpText="Número de dias antes que o pop-up seja mostrado novamente para o mesmo usuário após ser fechado."
                    error={actionData?.errors?.reopenAfter}
                  />
                  <Select
                    label="Exibir Pop-up Somente para Novos Usuários?"
                    name="showOnlyNewUsers"
                    options={[
                      { label: 'Não', value: 'false' },
                      { label: 'Sim', value: 'true' },
                    ]}
                    onChange={(value) => setShowOnlyNewUsers(value === 'true')}
                    value={showOnlyNewUsers.toString()}
                    error={actionData?.errors?.showOnlyNewUsers}
                  />
                  <Select
                    label="Mostrar nas Páginas"
                    name="showOnPages"
                    options={pageOptions}
                    onChange={setShowOnPages}
                    value={showOnPages}
                    error={actionData?.errors?.showOnPages}
                  />
                  {showOnPages === 'specific' && (
                    <TextField
                      label="Páginas Específicas"
                      name="specificPages"
                      value={specificPages}
                      onChange={setSpecificPages}
                      autoComplete="off"
                      multiline={2}
                      helpText="Insira as URLs ou caminhos das páginas, separados por vírgula."
                      error={actionData?.errors?.specificPages}
                    />
                  )}
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird"> {/* Coluna para o preview */}
            <Box borderColor="border" borderWidth="025" borderRadius="200" padding="400" background="bg-surface-secondary">
              <BlockStack gap="300">
                <Text variant="headingMd" as="h3">Preview do Pop-up</Text>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', height: '300px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <iframe
                    srcDoc={modalHtml}
                    title="Preview do Pop-up"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-scripts"
                  />
                </div>
                <Text variant="bodySm" as="p" tone="subdued">
                  O preview é uma representação aproximada e pode variar ligeiramente na loja real.
                </Text>
              </BlockStack>
            </Box>
          </Layout.Section>

        </Layout>
        <PageActions
          primaryAction={{
            content: 'Salvar Pop-up',
            loading: isSubmitting,
            submit: true,
          }}
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => navigate('/app/popups'),
            },
          ]}
        />
      </RemixForm>
    </Page>
  );
}