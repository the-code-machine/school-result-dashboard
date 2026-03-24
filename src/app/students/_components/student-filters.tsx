"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  filterResult: string;
  onFilterResult: (v: string) => void;
  filterCategory: string;
  onFilterCategory: (v: string) => void;
  filterGender: string;
  onFilterGender: (v: string) => void;
  total: number;
}

export function StudentFilters({
  search,
  onSearch,
  filterResult,
  onFilterResult,
  filterCategory,
  onFilterCategory,
  filterGender,
  onFilterGender,
  total,
}: Props) {
  const hasFilter =
    search ||
    filterResult !== "all" ||
    filterCategory !== "all" ||
    filterGender !== "all";

  const clearAll = () => {
    onSearch("");
    onFilterResult("all");
    onFilterCategory("all");
    onFilterGender("all");
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-8 h-8 text-sm"
          placeholder="Search name, roll, scholar no..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Result filter */}
      <Select value={filterResult} onValueChange={onFilterResult}>
        <SelectTrigger className="w-32 h-8 text-sm">
          <SelectValue placeholder="Result" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Results</SelectItem>
          <SelectItem value="PASS">Pass</SelectItem>
          <SelectItem value="FAIL">Fail</SelectItem>
          <SelectItem value="SUPPLEMENTARY">Suppl.</SelectItem>
          <SelectItem value="ABSENT">Absent</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
        </SelectContent>
      </Select>

      {/* Category */}
      <Select value={filterCategory} onValueChange={onFilterCategory}>
        <SelectTrigger className="w-28 h-8 text-sm">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="GEN">GEN</SelectItem>
          <SelectItem value="OBC">OBC</SelectItem>
          <SelectItem value="SC">SC</SelectItem>
          <SelectItem value="ST">ST</SelectItem>
        </SelectContent>
      </Select>

      {/* Gender */}
      <Select value={filterGender} onValueChange={onFilterGender}>
        <SelectTrigger className="w-24 h-8 text-sm">
          <SelectValue placeholder="Gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="M">Male</SelectItem>
          <SelectItem value="F">Female</SelectItem>
          <SelectItem value="O">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* Count + clear */}
      <p className="text-xs text-gray-400 self-center">{total} shown</p>
      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs gap-1 text-gray-500"
          onClick={clearAll}
        >
          <X className="w-3 h-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
