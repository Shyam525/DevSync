export function paginate(page = 1, limit = 20) {
  const pageNumber = Math.max(1, page);
  const pageSize = Math.max(1, limit);
  return {
    skip: (pageNumber - 1) * pageSize,
    limit: pageSize,
  };
}
