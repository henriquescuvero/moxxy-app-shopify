import { json } from "@remix-run/node";
import { prisma } from "../db.server";
import { authenticate } from "../../shopify.server";
import { Metrics } from "./types";
import { Request } from "express";
import { Params } from "@remix-run/router";

export async function loader({ request }: { request: Request }) {
  const shop = await requireShop(request);
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  try {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    const where: any = { shopId: shop.id };

    if (startDate) {
      where.created_at = { gte: new Date(startDate) };
    }

    if (endDate) {
      where.created_at = { lte: new Date(endDate) };
    }

    if (status) {
      where.status = status;
    }

    const metrics = await prisma.popup.findMany({
      where,
      select: {
        metrics: true,
        title: true,
        status: true,
        created_at: true,
      },
    });

    const totalImpressions = metrics.reduce((sum: number, popup: any) => sum + popup.metrics.impressions, 0);
    const totalClicks = metrics.reduce((sum: number, popup: any) => sum + popup.metrics.clicks, 0);
    const conversionRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return json({
      success: true,
      data: {
        totalImpressions,
        totalClicks,
        conversionRate,
        byPopup: metrics,
      },
    });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 500 });
  }
}

export async function action({ request }: { request: Request }) {
  const shop = await requireShop(request);
  const formData = await request.json();

  try {
    const { popupId, type, value } = formData;

    if (!popupId || !type || !value) {
      return json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const popup = await prisma.popup.update({
      where: { id: popupId, shopId: shop.id },
      data: {
        metrics: {
          update: {
            [type === "impression" ? "impressions" : "clicks"]: {
              increment: value,
            },
            lastUpdated: new Date(),
          },
        },
      },
    });

    return json({ success: true, data: popup });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : "An unknown error occurred" }, { status: 400 });
  }
}
