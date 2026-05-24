export function parseListPagination(query: { page?: number; limit?: number }) {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(100, Math.max(1, query.limit ?? 20));
  const skip = (page - 1) * limit;
  const totalPages = (total: number) => Math.max(1, Math.ceil(total / limit) || 1);
  return { page, limit, skip, totalPages };
}
