const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
};

const buildPaginationMeta = (totalItems, page, pageSize) => {
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  return {
    totalItems,
    totalPages,
    page,
    pageSize,
  };
};

module.exports = {
  getPagination,
  buildPaginationMeta,
};
