import { Table } from 'antd'
import type { TableProps } from 'antd'
import { useTranslation } from 'react-i18next'

interface DataTableProps<T = any> extends Omit<TableProps<T>, 'pagination'> {
  pagination?: false | TableProps<T>['pagination']
  pageSize?: number
  total?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  onPageChange?: (page: number, pageSize: number) => void
}

export default function DataTable<T extends object = any>({
  pagination,
  pageSize = 10,
  total,
  showSizeChanger = true,
  showQuickJumper,
  onPageChange,
  ...rest
}: DataTableProps<T>) {
  const { t } = useTranslation()

  const paginationConfig =
    pagination === false
      ? false
      : {
          pageSize,
          total,
          showSizeChanger,
          showQuickJumper,
          showTotal: (total: number) => `${t('common.total')}: ${total}`,
          ...(onPageChange && {
            onChange: (page: number, ps: number) => onPageChange(page, ps),
          }),
          ...(typeof pagination === 'object' ? pagination : {}),
        }

  return (
    <Table<T>
      size="middle"
      pagination={paginationConfig}
      locale={{ emptyText: t('common.noData') }}
      {...rest}
    />
  )
}
