import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Drawer, Input, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

export interface EntityTableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  render?: (entity: T) => ReactNode;
}

export interface EntityTableConfig<T> {
  /** Optional; omit when the parent page already provides a heading. */
  tableTitle?: string;
  columns: Array<EntityTableColumn<T>>;
  fetchPage: (page: number, pageSize: number, textSearch: string) => Promise<{ data: T[]; totalElements: number }>;
  /** When set, clicking a row runs this (e.g. navigate) instead of opening the details drawer. */
  onRowClick?: (entity: T) => void;
  detailsPanelTitle?: string;
  renderDetailsPanel?: (entity: T, close: () => void) => ReactNode;
}

interface EntitiesTableProps<T extends { id: { id: string } }> {
  config: EntityTableConfig<T>;
}

export function EntitiesTable<T extends { id: { id: string } }>({ config }: EntitiesTableProps<T>) {
  const { t } = useTranslation();
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsEntity, setDetailsEntity] = useState<T | null>(null);

  const navigateOnRow = !!config.onRowClick;

  async function loadData(nextPage = page, nextPageSize = pageSize, nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const result = await config.fetchPage(nextPage, nextPageSize, nextSearch);
      setItems(result.data);
      setTotal(result.totalElements);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData(0, pageSize, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  const columns: ColumnsType<T> = useMemo(
    () =>
      config.columns.map((col) => ({
        title: col.title,
        key: String(col.key),
        width: col.width,
        ellipsis: true,
        render: (_: unknown, record: T) =>
          col.render ? col.render(record) : String((record as Record<string, unknown>)[String(col.key)] ?? ""),
      })),
    [config.columns]
  );

  return (
    <div>
      {config.tableTitle ? (
        <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
          {config.tableTitle}
        </Typography.Title>
      ) : null}

      <Space wrap style={{ marginBottom: 16 }} size="middle">
        <Input.Search
          allowClear
          placeholder={t("common.search")}
          style={{ width: 280 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={(value) => {
            setPage(0);
            void loadData(0, pageSize, value);
          }}
          onClear={() => {
            setSearch("");
            setPage(0);
            void loadData(0, pageSize, "");
          }}
        />
      </Space>

      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />
      )}

      <Table<T>
        size="middle"
        rowKey={(r) => r.id.id}
        loading={loading}
        columns={columns}
        dataSource={items}
        locale={{ emptyText: t("common.noData") }}
        pagination={{
          current: page + 1,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (n) => `${t("common.total")}: ${n}`,
          onChange: (p, ps) => {
            const zero = p - 1;
            setPage(zero);
            setPageSize(ps);
            void loadData(zero, ps, search);
          },
        }}
        onRow={(record) => ({
          onClick: () => {
            if (navigateOnRow) {
              config.onRowClick?.(record);
            } else {
              setDetailsEntity(record);
            }
          },
          style: { cursor: "pointer" },
        })}
      />

      {!navigateOnRow && (
        <Drawer
          title={config.detailsPanelTitle ?? t("common.details")}
          width={400}
          open={!!detailsEntity}
          onClose={() => setDetailsEntity(null)}
          destroyOnClose
        >
          {detailsEntity &&
            (config.renderDetailsPanel ? (
              config.renderDetailsPanel(detailsEntity, () => setDetailsEntity(null))
            ) : (
              <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(detailsEntity, null, 2)}</pre>
            ))}
        </Drawer>
      )}
    </div>
  );
}
