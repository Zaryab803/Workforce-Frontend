"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Empty } from "./index";
export function DataTable<T>({
  data,
  columns,
  sortBy,
  sortOrder,
  onSort,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  sortBy?: string;
  sortOrder?: string;
  onSort?: (id: string) => void;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
    },
  });
  return (
    <div className="table-scroll">
      <table>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id}>
                  {header.column.getCanSort() && onSort ? (
                    <button
                      className="table-sort"
                      onClick={() => onSort(header.column.id)}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <ArrowUpDown size={12} />
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!data.length && (
        <Empty
          title="No results found"
          description="Try another search or clear your filters."
        />
      )}
    </div>
  );
}
