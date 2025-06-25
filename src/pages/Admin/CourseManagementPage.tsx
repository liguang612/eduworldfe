import React, { useState, useMemo } from 'react';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Course = {
  id: number;
  name: string;
  teacher: string;
  students: number;
  created: string;
  subject: string;
};

type SortKey = keyof Course | '';

const coursesData: Course[] = [
  { id: 1, name: "Introduction to React", teacher: "Jane Smith", students: 150, created: "2023-01-10", subject: "Programming" },
  { id: 2, name: "Advanced TypeScript", teacher: "Jane Smith", students: 75, created: "2023-02-01", subject: "Programming" },
  { id: 3, name: "State Management with Redux", teacher: "John Doe", students: 120, created: "2023-03-05", subject: "Programming" },
  { id: 4, name: "History of Ancient Rome", teacher: "Dr. Livy", students: 85, created: "2022-09-15", subject: "History" },
  { id: 5, name: "Calculus I", teacher: "Prof. Newton", students: 200, created: "2023-01-20", subject: "Mathematics" },
];

const CourseManagementPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedCourses = useMemo(() => {
    let sortableCourses = [...coursesData];
    if (sortKey) {
      sortableCourses.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableCourses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.subject.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-[#0e141b] tracking-light text-[28px] font-bold leading-tight">Course Management</h1>
        <p className="text-[#4e7397] mt-1">Browse, search, and manage courses.</p>
      </div>
      <div className="bg-white p-4 rounded-xl border border-[#d0dbe7]">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, teacher, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm px-4 py-2 rounded-lg border border-[#d0dbe7] focus:outline-none focus:ring-2 focus:ring-[#1980e6] focus:border-transparent text-sm"
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-[#d0dbe7]">
          <table className="w-full">
            <thead>
              <tr className="bg-white">
                <SortableHeader sortKey="name">Course Name</SortableHeader>
                <SortableHeader sortKey="teacher">Teacher</SortableHeader>
                <SortableHeader sortKey="students">Students</SortableHeader>
                <SortableHeader sortKey="created">Created Date</SortableHeader>
                <th className="px-4 py-3 text-left text-[#0e141b] text-sm font-bold leading-normal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCourses.map((course) => (
                <tr key={course.id} className="border-t border-t-[#d0dbe7] hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-medium text-[#0e141b]">{course.name}</p>
                    <p className="text-sm text-[#4e7397]">{course.subject}</p>
                  </td>
                  <td className="p-4 text-[#0e141b]">{course.teacher}</td>
                  <td className="p-4 text-[#4e7397]">{course.students}</td>
                  <td className="p-4 text-[#4e7397]">{new Date(course.created).toLocaleDateString()}</td>
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
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">Delete Course</DropdownMenuItem>
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

export default CourseManagementPage; 