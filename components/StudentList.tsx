import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { Icons } from './Icons';

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const StudentList: React.FC<StudentListProps> = ({ students, onEdit, onDelete }) => {
  // Separate states for each filter
  const [filters, setFilters] = useState({
    fullName: '',
    faculty: '',
    specialization: '',
    course: '',
    mahalla: '',
    street: ''
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Derived options for dropdowns based on existing data
  const facultyOptions = useMemo(() => Array.from(new Set(students.map(s => s.faculty))).sort(), [students]);
  const courseOptions = useMemo(() => Array.from(new Set(students.map(s => s.course))).sort(), [students]);
  const mahallaOptions = useMemo(() => Array.from(new Set(students.map(s => s.mahalla))).sort(), [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchName = !filters.fullName || student.fullName.toLowerCase().includes(filters.fullName.toLowerCase());
      const matchFaculty = !filters.faculty || student.faculty === filters.faculty;
      const matchSpec = !filters.specialization || student.specialization.toLowerCase().includes(filters.specialization.toLowerCase());
      const matchCourse = !filters.course || student.course === filters.course;
      const matchMahalla = !filters.mahalla || student.mahalla === filters.mahalla;
      const matchStreet = !filters.street || student.street.toLowerCase().includes(filters.street.toLowerCase());

      return matchName && matchFaculty && matchSpec && matchCourse && matchMahalla && matchStreet;
    });
  }, [students, filters]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      fullName: '',
      faculty: '',
      specialization: '',
      course: '',
      mahalla: '',
      street: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 text-center">
        <div className="bg-blue-50 p-6 rounded-full mb-4 animate-pulse">
          <Icons.UserPlus className="w-10 h-10 text-blue-400" />
        </div>
        <p className="text-gray-800 font-bold text-lg">Hozircha talabalar ro'yxati bo'sh</p>
        <p className="text-gray-400 mt-2 max-w-sm">Chap tomondagi panel orqali hududni tanlang va yangi talabalarni tizimga qo'shing.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6 flex flex-col">
      {/* Header with Filters */}
      <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
             <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Icons.Filter className="w-5 h-5" />
             </div>
            <div>
               <h3 className="font-bold text-gray-800">Qidiruv va Filtrlash</h3>
               <p className="text-xs text-gray-400">Jami {students.length} tadan {filteredStudents.length} ta ko'rsatilmoqda</p>
            </div>
          </div>
          
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icons.X className="w-3 h-3" /> Tozalash
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* F.I.Sh Filter */}
          <div className="relative group">
            <Icons.Search className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="F.I.Sh bo'yicha qidirish"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
              value={filters.fullName}
              onChange={(e) => handleFilterChange('fullName', e.target.value)}
            />
          </div>

          {/* Faculty Filter */}
          <select
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            value={filters.faculty}
            onChange={(e) => handleFilterChange('faculty', e.target.value)}
          >
            <option value="">Barcha fakultetlar</option>
            {facultyOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {/* Specialization Filter */}
          <input
            type="text"
            placeholder="Yo'nalish (mutaxassislik)"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
          />

          {/* Course Filter */}
          <select
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            value={filters.course}
            onChange={(e) => handleFilterChange('course', e.target.value)}
          >
            <option value="">Barcha kurslar</option>
            {courseOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Mahalla Filter */}
          <select
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            value={filters.mahalla}
            onChange={(e) => handleFilterChange('mahalla', e.target.value)}
          >
            <option value="">Barcha mahallalar</option>
            {mahallaOptions.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {/* Street Filter */}
          <input
            type="text"
            placeholder="Ko'cha nomi"
            className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
            value={filters.street}
            onChange={(e) => handleFilterChange('street', e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 h-full">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
              <Icons.Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-700">Hech narsa topilmadi</p>
            <p className="text-sm text-gray-400">Qidiruv parametrlarini o'zgartirib ko'ring</p>
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg font-medium hover:bg-blue-100 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur-sm text-xs uppercase text-gray-500 font-bold sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-16 tracking-wider">Rasm</th>
                <th className="px-6 py-4 tracking-wider">Talaba</th>
                <th className="px-6 py-4 tracking-wider">Fakultet / Yo'nalish</th>
                <th className="px-6 py-4 tracking-wider">Kurs / Guruh</th>
                <th className="px-6 py-4 tracking-wider">Manzil (Sirdaryo)</th>
                <th className="px-6 py-4 tracking-wider text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-2 items-center">
                        {/* Avatar */}
                        {student.photoUrl ? (
                        <img 
                            src={student.photoUrl} 
                            alt={student.fullName} 
                            className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                            title="Talaba rasmi"
                        />
                        ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm text-gray-400">
                            <Icons.Image className="w-6 h-6" />
                        </div>
                        )}
                        
                        {/* House Image Indicator */}
                        {student.housePhotoUrls && student.housePhotoUrls.length > 0 && (
                            <div className="relative group/house cursor-pointer">
                                <img 
                                    src={student.housePhotoUrls[0]} 
                                    alt="Uy" 
                                    className="w-10 h-8 rounded-lg object-cover border border-gray-200 opacity-80 hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                     <Icons.Home className="w-3 h-3 text-white" />
                                </div>
                                {student.housePhotoUrls.length > 1 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white ring-2 ring-white">
                                        +{student.housePhotoUrls.length - 1}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                      <div>
                        <p className="font-bold text-gray-900 text-base">{student.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${student.gender === 'Erkak' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {student.gender}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Icons.Search className="w-3 h-3" /> {student.phone}
                            </span>
                        </div>
                      </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                        <Icons.School className="w-3 h-3" />
                        {student.faculty}
                      </div>
                      <p className="text-xs text-gray-600 font-medium pl-1">
                        {student.specialization}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-gray-100 border border-gray-200">
                             <span className="text-xs font-bold text-gray-900">{student.course.split('-')[0]}</span>
                             <span className="text-[9px] text-gray-500 uppercase">Kurs</span>
                        </div>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{student.group}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-semibold">Guruh</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col relative pl-4 border-l-2 border-emerald-100">
                      <span className="text-gray-900 font-semibold text-sm">{student.mahalla} MFY</span>
                      <span className="text-gray-500 text-xs mt-0.5">{student.street} ko'chasi, {student.houseNumber}-uy</span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-wide">{student.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEdit(student)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors shadow-sm bg-white border border-blue-100"
                        title="Tahrirlash"
                      >
                        <Icons.Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(student.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors shadow-sm bg-white border border-red-100"
                        title="O'chirish"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            Jami <span className="font-bold text-gray-800">{filteredStudents.length}</span> ta talabadan <span className="font-bold text-gray-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-gray-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}</span> tasi ko'rsatilmoqda
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Oldingi sahifa"
            >
              <Icons.ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                 // Logic to show limited page numbers if there are too many pages (optional, for now simple list)
                 // Simple version: show all if <= 7, otherwise ellipsis logic (omitted for brevity, assume reasonable count)
                 if (totalPages > 7) {
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                         return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                              }`}
                            >
                              {page}
                            </button>
                          );
                    } else if (page === 2 || page === totalPages - 1) {
                         return <span key={page} className="text-gray-400 text-xs">...</span>;
                    }
                    return null;
                 }
                 
                 return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              title="Keyingi sahifa"
            >
              <Icons.ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};