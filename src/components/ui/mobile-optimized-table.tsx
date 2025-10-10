import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedTableProps {
  data: any[];
  columns: {
    header: string;
    accessor: string;
    cell?: (value: any, row: any) => React.ReactNode;
    className?: string;
  }[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export function MobileOptimizedTable({
  data,
  columns,
  onRowClick,
  className
}: MobileOptimizedTableProps) {
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {data.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="bg-card border rounded-lg p-4 shadow-sm"
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-muted-foreground">{column.header}</span>
                <span className={cn("text-sm", column.className)}>
                  {column.cell ? column.cell(row[column.accessor], row) : row[column.accessor]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted">
            {columns.map((column, index) => (
              <th key={index} className="text-left p-3 text-sm font-medium text-muted-foreground">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className={cn("p-3 text-sm", column.className)}>
                  {column.cell ? column.cell(row[column.accessor], row) : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}