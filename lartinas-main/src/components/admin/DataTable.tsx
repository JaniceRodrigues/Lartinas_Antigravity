import { ReactNode, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  onRowClick,
  empty = "Sem registros.",
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  onRowClick?: (row: T) => void;
  empty?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q || !searchKeys?.length) return rows;
    const lc = q.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String((r as any)[k] ?? "").toLowerCase().includes(lc)),
    );
  }, [rows, q, searchKeys]);

  return (
    <div className="rounded-3xl border border-border bg-card shadow-soft">
      {searchKeys?.length ? (
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar..."
            className="h-9 border-0 shadow-none focus-visible:ring-0"
          />
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 text-left font-medium ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-border/60 ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
