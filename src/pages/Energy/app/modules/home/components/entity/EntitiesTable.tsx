import { useMemo, useState } from "react";

export interface EntityTableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  render?: (entity: T) => React.ReactNode;
}

export interface EntityTableConfig<T> {
  tableTitle: string;
  columns: Array<EntityTableColumn<T>>;
  fetchPage: (page: number, pageSize: number, textSearch: string) => Promise<{ data: T[]; totalElements: number }>;
  onRowClick?: (entity: T) => void;
}

interface EntitiesTableProps<T extends { id: { id: string } }> {
  config: EntityTableConfig<T>;
}

export function EntitiesTable<T extends { id: { id: string } }>({ config }: EntitiesTableProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadData(nextPage = page, nextPageSize = pageSize, nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const result = await config.fetchPage(nextPage, nextPageSize, nextSearch);
      setItems(result.data);
      setTotal(result.totalElements);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  useMemo(() => {
    void loadData(0, pageSize, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section style={{ padding: 16 }}>
      <h2>{config.tableTitle}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={search}
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(0);
              void loadData(0, pageSize, e.currentTarget.value);
            }
          }}
        />
        <button onClick={() => void loadData(0, pageSize, search)}>Search</button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <table width="100%" cellPadding={8}>
        <thead>
          <tr>
            {config.columns.map((col) => (
              <th key={String(col.key)} style={{ textAlign: "left", width: col.width }}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id.id}
              onClick={() => config.onRowClick?.(item)}
              style={{ cursor: config.onRowClick ? "pointer" : "default", borderTop: "1px solid #eee" }}
            >
              {config.columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(item) : String((item as Record<string, unknown>)[String(col.key)] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <button disabled={page === 0} onClick={() => { const p = page - 1; setPage(p); void loadData(p, pageSize, search); }}>
          Prev
        </button>
        <button
          disabled={(page + 1) * pageSize >= total}
          onClick={() => {
            const p = page + 1;
            setPage(p);
            void loadData(p, pageSize, search);
          }}
        >
          Next
        </button>
        <span>Page: {page + 1}</span>
        <span>Total: {total}</span>
        <select
          value={pageSize}
          onChange={(e) => {
            const size = Number(e.target.value);
            setPageSize(size);
            setPage(0);
            void loadData(0, size, search);
          }}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </section>
  );
}
