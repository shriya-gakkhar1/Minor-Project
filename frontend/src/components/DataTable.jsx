import { cn } from '../lib/utils';

export default function DataTable({ columns, rows, emptyText = 'No rows found', className }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white', className)}>
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-slate-200 text-sm'>
          <thead className='bg-slate-50'>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500'
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100'>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.id} className='transition-colors hover:bg-slate-50'>
                  {columns.map((column) => (
                    <td key={`${row.id}_${column.key}`} className='px-4 py-3 text-slate-700'>
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className='px-4 py-8 text-center text-sm text-slate-500' colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
