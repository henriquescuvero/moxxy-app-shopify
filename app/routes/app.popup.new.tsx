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

  return (
    <Page>
      <TitleBar title="Criar Novo Pop-up" />
      <RemixForm method="post">
        <Layout>
          <Layout.Section>
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
                      label="Páginas Específicas (URLs separadas por vírgula)"
                      name="specificPages"
                      value={specificPages}
                      onChange={setSpecificPages}
                      autoComplete="off"
                      multiline={2}
                      helpText="Ex: /products/meu-produto, /collections/ofertas"
                      error={actionData?.errors?.specificPages}
                    />
                  )}
                  {/* Botão de submit explícito aqui dentro do FormLayout */}
                  <Button submit variant="primary" loading={isSubmitting}>
                    Salvar Pop-up
                  </Button>
                </FormLayout>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Card>
                <BlockStack gap="200">
                    <Text as="h2" variant="headingMd">Preview do Pop-up</Text>
                    <Text as="p" tone="subdued">O preview será implementado aqui.</Text>
                </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
        {/* PageActions agora só tem a ação secundária ou pode ser omitido se não houver */}
        <PageActions
          secondaryActions={[
            {
              content: 'Cancelar',
              onAction: () => navigate('/app/popups'),
              disabled: isSubmitting,
            },
          ]}
        />
      </RemixForm>
    </Page>
  );
}