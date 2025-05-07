import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { login } from "../../shopify.server";

import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

interface AppProps {
  showForm: boolean;
}

const AppContent = ({ showForm }: AppProps) => {
  return (
    <div className={styles.content}>
      <div className={styles.titleSection}>
        <h1 className={styles.heading}>Conecte sua loja ao nosso app</h1>
        <p className={styles.text}>
          Automatize processos, economize tempo e ofereça experiências melhores para seus clientes.
        </p>
      </div>

      {showForm && (
        <div className={styles.formSection}>
          <Form className={styles.form} method="post" action="/auth/login">
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Insira o domínio da sua loja</span>
                <input
                  className={styles.input}
                  type="text"
                  name="shop"
                  placeholder="sua-loja.myshopify.com"
                  aria-label="Domínio da loja"
                />
                <span className={styles.inputHint}>Exemplo: minha-loja.myshopify.com</span>
              </label>
              <button className={styles.button} type="submit">
                Acessar minha loja
              </button>
            </div>
          </Form>
        </div>
      )}

      <div className={styles.featuresSection}>
        <h2 className={styles.sectionTitle} hidden>Benefícios</h2>
        <ul className={styles.list}>
          <li>
            <strong>Instalação rápida</strong>. Conecte sua loja em poucos segundos com nosso processo simplificado.
          </li>
          <li>
            <strong>Gestão automatizada</strong>. Automatize tarefas repetitivas para focar no que realmente importa.
          </li>
          <li>
            <strong>Integração com Shopify</strong>. Compatível com todas as funções essenciais da sua loja.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <AppContent showForm={showForm} />
    </div>
  );
}
