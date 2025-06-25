import React, { useState, useMemo } from 'react';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Lecture = {
  id: number;
  name: string;
  course: string;
  teacher: string;
  created: string;
  duration: number; // in minutes
};

type SortKey = keyof Lecture | '';

const lecturesData: Lecture[] = [
  { id: 1, name: "Introduction to React Hooks", course: "Introduction to React", teacher: "Jane Smith", created: "2023-01-12", duration: 25 },
  { id: 2, name: "Understanding Props and State", course: "Introduction to React", teacher: "Jane Smith", created: "2023-01-13", duration: 35 },
  { id: 3, name: "Generics in TypeScript", course: "Advanced TypeScript", teacher: "Jane Smith", created: "2023-02-05", duration: 45 },
  { id: 4, name: "The Roman Republic", course: "History of Ancient Rome", teacher: "Dr. Livy", created: "2022-09-20", duration: 50 },
  { id: 5, name: "Derivatives and Integrals", course: "Calculus I", teacher: "Prof. Newton", created: "2023-01-25", duration: 60 },
];

const LectureManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedLectures = useMemo(() => {
    let sortableLectures = [...lecturesData];
    if (sortKey) {
      sortableLectures.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableLectures.filter(lecture =>
      lecture.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const SortableHeader = ({ children, sortKey: key }: { children: React.ReactNode, sortKey: SortKey }) => (
    <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal cursor-pointer hover:bg-slate-100" onClick={() => handleSort(key)}>
      <div className="flex items-center gap-2">
        {children}
        {sortKey === key && <ArrowUpDown className="h-4 w-4" />}
      </div>
    </th>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">Lecture Management</h1>
        <p className="text-[#4e7397] mt-1">Browse, search, and manage lectures across all courses.</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-[#d0dbe7]">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, course, or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent text-sm"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-[#d0dbe7]">
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <SortableHeader sortKey="name">Lecture Name</SortableHeader>
                <SortableHeader sortKey="course">Course</SortableHeader>
                <SortableHeader sortKey="duration">Duration (min)</SortableHeader>
                <SortableHeader sortKey="created">Created Date</SortableHeader>
                <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedLectures.map((lecture) => (
                <tr key={lecture.id} className="border-t border-t-[#d0dbe7] hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-[#0e141b]">{lecture.name}</p>
                    <p className="text-sm text-[#4e7397]">by {lecture.teacher}</p>
                  </td>
                  <td className="p-4 text-[#0e141b]">{lecture.course}</td>
                  <td className="p-4 text-[#4e7397]">{lecture.duration}</td>
                  <td className="p-4 text-[#4e7397]">{new Date(lecture.created).toLocaleDateString()}</td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Delete Lecture</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LectureManagementPage; 