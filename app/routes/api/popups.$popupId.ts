import { json } from "@remix-run/node";
import { Popup, popupSchema } from "./types";
import prisma from "../../db.server"; // Correção da importação de db.server
import { authenticate } from "../../shopify.server";
import { Params } from "@remix-run/router";
import type { RequestHandler } from "@remix-run/node";

export async function loader({ request, params }: { request: Request; params: { popupId: string } }) {
  try {
    const { session } = await authenticate.admin(request); // Adiciona autenticação e obtém session

    const popup = await prisma.popup.findUnique({
      where: { id: params.popupId, shopId: session.shop }, // Usa session.shop
    });

    if (!popup) {
      return json({ success: false, error: "Popup not found" }, { status: 404 });
    }

    return json({ success: true, data: popup });
  } catch (error: any) { // Trata 'error' como 'any' e relança Response se for o caso
    if (error instanceof Response) {
      throw error;
    }
    return json({ success: false, error: error.message || "An unknown error occurred" }, { status: 500 });
  }
}

export async function action({ request, params }: { request: Request; params: { popupId: string } }) {
  // Correção da autenticação:
  const { session } = await authenticate.admin(request);
  // Se authenticate.admin(request) falhar, ele lança uma Response.
  // A sessão é garantida se a linha acima não lançar erro.

  const formData = await request.json();
  const method = request.method.toUpperCase();

  try {
    if (method === "PUT") {
      const validatedData = popupSchema.parse(formData);

      // Buscar o popup existente para preservar as métricas atuais
      const existingPopup = await prisma.popup.findUnique({
        where: { id: params.popupId, shopId: session.shop },
        select: { metrics: true },
      });

      if (!existingPopup) {
        return json({ success: false, error: "Popup not found or access denied" }, { status: 404 });
      }

      const updatedMetrics = {
        ...(typeof existingPopup.metrics === 'object' && existingPopup.metrics !== null ? existingPopup.metrics : { impressions: 0, clicks: 0, conversionRate: 0 }),
        lastUpdated: new Date(),
      };

      const popup = await prisma.popup.update({
        where: { id: params.popupId, shopId: session.shop }, // Correção: Usar session.shop
        data: {
          ...validatedData,
          metrics: updatedMetrics,
        },
      });

      return json({ success: true, data: popup });
    } else if (method === "DELETE") {
      // Não é necessário buscar o popup novamente para deletar, mas a condição de shopId deve ser mantida
      const popup = await prisma.popup.delete({
        where: { id: params.popupId, shopId: session.shop }, // Correção: Usar session.shop
      });

      return json({ success: true, data: popup });
    }

    return json({ success: false, error: "Method not allowed" }, { status: 405 });
  } catch (error: any) {
    return json({ success: false, error: error.message }, { status: 400 });
  }
}
