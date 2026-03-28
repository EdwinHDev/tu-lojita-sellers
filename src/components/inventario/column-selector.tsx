"use client";

import {
  Settings02Icon,
  CheckmarkCircle01Icon,
  CircleIcon,
  ViewIcon,
  ViewOffIcon
} from "hugeicons-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  alwaysVisible?: boolean;
}

interface ColumnSelectorProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

export function ColumnSelector({ columns, onChange }: ColumnSelectorProps) {
  const toggleColumn = (id: string) => {
    const newColumns = columns.map((col) => {
      if (col.id === id && !col.alwaysVisible) {
        return { ...col, visible: !col.visible };
      }
      return col;
    });
    onChange(newColumns);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button 
            variant="outline" 
            size="sm" 
            className="h-10 rounded-xl border-gray-200 dark:border-gray-800 font-bold gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
          >
            <Settings02Icon size={16} className="text-gray-500" />
            <span className="hidden sm:inline">Columnas</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-gray-100 dark:border-gray-800 p-2 shadow-2xl">
        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 py-1.5">
          Visibilidad de Columnas
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-50 dark:bg-gray-800" />
        <div className="space-y-1 pt-1">
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.visible}
              onCheckedChange={() => toggleColumn(column.id)}
              disabled={column.alwaysVisible}
              className="rounded-xl text-sm font-bold focus:bg-indigo-50 dark:focus:bg-indigo-950/30 focus:text-indigo-600 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {column.visible ? (
                  <ViewIcon size={14} className="text-indigo-500" />
                ) : (
                  <ViewOffIcon size={14} className="text-gray-400" />
                )}
                {column.label}
              </div>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
