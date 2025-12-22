export interface PaginationParams {
  page?: number | string;
  per_page?: number | string;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginationResult {
  page: number;
  perPage: number;
  offset: number;
}

export const getPagination = (
  params: PaginationParams = {}
): PaginationResult => {
  const page =
    Number(params.page) && Number(params.page) > 0
      ? Number(params.page)
      : 1;

  const perPage =
    Number(params.per_page) && Number(params.per_page) > 0
      ? Number(params.per_page)
      : 10;

  const offset = (page - 1) * perPage;

  return { page, perPage, offset };
};

export const buildPaginationMeta = (
  page: number,
  perPage: number,
  total: number
): PaginationMeta => ({
  current_page: page,
  per_page: perPage,
  total,
  total_pages: Math.ceil(total / perPage),
});
