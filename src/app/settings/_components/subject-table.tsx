"use client";

import { useState, useMemo } from "react";
import { useSettingsStore } from "@/store/settings";
import { DEFAULT_SUBJECTS } from "@/lib/defaults";
import { toast } from "@/hooks/use-toast";
import type { SubjectRule } from "@/types";
import { SubjectDialog } from "./subject-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  Download,
} from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  core: "bg-blue-100 text-blue-800",
  language: "bg-violet-100 text-violet-800",
  vocational: "bg-amber-100 text-amber-800",
  arts: "bg-pink-100 text-pink-800",
};

export function SubjectTable() {
  const { subjects, addSubject, updateSubject, deleteSubject, resetSubjects } =
    useSettingsStore();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SubjectRule | null>(null);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.code.toString().includes(search) ||
        (s.nameHindi ?? "").includes(search);
      const matchType = filterType === "all" || s.type === filterType;
      return matchSearch && matchType;
    });
  }, [subjects, search, filterType]);

  const handleSave = (s: SubjectRule) => {
    const exists = subjects.find((x) => x.code === s.code);
    if (exists) {
      updateSubject(s.code, s);
      toast({
        variant: "success",
        title: "Updated",
        description: `${s.name} updated.`,
      });
    } else {
      addSubject(s);
      toast({
        variant: "success",
        title: "Added",
        description: `${s.name} added.`,
      });
    }
  };

  const handleDelete = (code: number, name: string) => {
    deleteSubject(code);
    toast({ title: "Deleted", description: `${name} removed.` });
  };

  const handleReset = () => {
    resetSubjects();
    toast({ title: "Reset", description: "Subject master reset to defaults." });
  };

  const openAdd = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };
  const openEdit = (s: SubjectRule) => {
    setEditTarget(s);
    setDialogOpen(true);
  };

  const existingCodes = subjects.map((s) => s.code);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Subject Master</CardTitle>
              <CardDescription>
                {subjects.length} subjects configured · Codes, max marks, pass
                marks per type
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-gray-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Subject Master?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will restore all subjects to the default MPBSE list.
                      Any custom subjects you added will be removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>
                      Yes, Reset
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button size="sm" onClick={openAdd} className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Subject
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Search by name, code, Hindi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="language">Language</SelectItem>
                <SelectItem value="core">Core</SelectItem>
                <SelectItem value="vocational">Vocational</SelectItem>
                <SelectItem value="arts">Arts</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 self-center">
              {filtered.length} shown
            </p>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Hindi</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-28 text-center hidden md:table-cell">
                  TH Max / Pass
                </TableHead>
                <TableHead className="w-28 text-center hidden md:table-cell">
                  PR Max / Pass
                </TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-gray-400 py-8"
                  >
                    No subjects found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((s) => (
                <TableRow key={s.code}>
                  <TableCell className="font-mono text-sm font-semibold text-gray-700">
                    {s.code}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-gray-900">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400 md:hidden">
                      TH {s.thMax}/{s.thPass} · PR {s.prMax}/{s.prPass}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-gray-500">
                    {s.nameHindi ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_COLORS[s.type]}`}
                    >
                      {s.type}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-sm">
                    <span className="font-medium">{s.thMax}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-emerald-600">{s.thPass}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-center text-sm">
                    <span className="font-medium">{s.prMax}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-emerald-600">{s.prPass}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(s)}
                        className="text-gray-400 hover:text-blue-600"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Subject?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove <strong>{s.name}</strong> (code {s.code})?
                              This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(s.code, s.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SubjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        initial={editTarget}
        existingCodes={existingCodes}
      />
    </>
  );
}
