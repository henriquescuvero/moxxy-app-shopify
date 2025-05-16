import prisma from "../db.server";

// Otimização de queries para popups
export const optimizedPopupsQuery = async (shopId: string) => {
  return prisma.popup.findMany({
    where: {
      shopId,
      status: "active",
    },
    select: popupSelect,
    orderBy: popupOrderBy,
  });
};

// Otimização de queries para métricas
export const optimizedMetricsQuery = async (popupId: string) => {
  return prisma.popup.findUnique({
    where: { id: popupId },
    select: {
      metrics: true,
      updatedAt: true,
    },
  });
};

// Paginação otimizada
export const optimizedPaginatedPopups = async (
  shopId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const skip = (page - 1) * pageSize;
  
  const [popups, total] = await Promise.all([
    prisma.popup.findMany({
      where: { shopId },
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        metrics: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.popup.count({ where: { shopId } }),
  ]);

  return {
    popups,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// Otimização de queries para relatórios
export const optimizedMetricsReport = async (shopId: string, dateRange: { start: Date; end: Date }) => {
  return prisma.popup.findMany({
    where: {
      shopId,
      updatedAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    select: {
      title: true,
      metrics: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};
