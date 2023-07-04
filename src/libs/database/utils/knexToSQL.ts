export const knexToSQL = (query: any): { sql: string; bindings: any[] } => {
  // Get the SQL query string and bindings
  // eslint-disable-next-line prefer-const
  let { sql, bindings } = query.toSQL();

  // Replace ? placeholders with $n placeholders
  for (let i = 0; i < bindings.length; i++) {
    sql = sql.replace('?', `$${i + 1}`);
  }

  return { sql, bindings };
};
