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
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { useIsXl } from "@/hooks/use-breakpoints";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const isXl = useIsXl();
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                <Button
                  variant="outline"
                  size={isXl ? "lg" : "icon-xl"}
                  iconSize="md"
                  className={cn("shrink-0", isXl && "px-4")}
                >
                  <Settings02Icon 
                    className="text-gray-500" 
                    {...(isXl && { "data-icon": "inline-start" })}
                  />
                  {isXl && <span>Columnas</span>}
                </Button>
                }
              />
            }
          />
          <TooltipContent className="font-bold">Configurar Visibilidad de Columnas</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-gray-100 dark:border-gray-800 p-2 shadow-2xl">
        <DropdownMenuGroup>
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
                    <ViewIcon size={20} className="text-indigo-500" />
                  ) : (
                    <ViewOffIcon size={20} className="text-gray-400" />
                  )}
                  {column.label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>

    </DropdownMenu>
  );
}
