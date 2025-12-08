import React, { useMemo, useState } from 'react';
import { Student } from '../types';
import { Icons } from './Icons';

interface MahallaStatsProps {
  students: Student[];
}

const ITEMS_PER_PAGE = 5;

export const MahallaStats: React.FC<MahallaStatsProps> = ({ students }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const data = useMemo(() => {
    const stats: Record<string, { 
      name: string; 
      city: string;
      total: number; 
      men: number; 
      women: number; 
    }> = {};

    students.forEach(s => {
      // Create a unique key using city + mahalla in case names duplicate across districts
      const key = `${s.city}-${s.mahalla}`;
      if (!stats[key]) {
        stats[key] = { name: s.mahalla, city: s.city, total: 0, men: 0, women: 0 };
      }
      const m = stats[key];
      m.total++;
      if (s.gender === 'Erkak') m.men++; else m.women++;
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [students]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [data, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (students.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-fade-in-down">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Icons.Home className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Mahallalar Kesimida Hisobot</h3>
          <p className="text-xs text-gray-500">Eng ko'p talaba yashaydigan mahallalar</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Mahalla</th>
              <th className="px-6 py-4">Tuman/Shahar</th>
              <th className="px-6 py-4 text-center">Jami</th>
              <th className="px-6 py-4">Jinsi (E/A)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{row.city}</td>
                <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 text-gray-700 font-bold text-xs">
                        {row.total}
                    </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 text-xs">
                    <span className="text-blue-600 font-medium">{row.men} E</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-pink-600 font-medium">{row.women} A</span>
                  </div>
                </td>
              </tr>
            ))}
            {/* Empty rows to keep height consistent if needed, optional */}
             {paginatedData.length < ITEMS_PER_PAGE && Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="h-[53px]">
                   <td colSpan={4}></td>
                </tr>
             ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
           <span className="text-xs text-gray-500">
              Jami {data.length} ta mahalladan {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, data.length)}
           </span>
           <div className="flex items-center gap-2">
             <button
               onClick={() => handlePageChange(currentPage - 1)}
               disabled={currentPage === 1}
               className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
             >
               <Icons.ChevronLeft className="w-4 h-4" />
             </button>
             <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                   // Simple logic to show first few pages or surrounding pages
                   // For this simple implementation, if pages < 5 show all, else logic can be complex
                   // Let's just show up to 5 page numbers for simplicity or current window
                   let p = i + 1;
                   if (totalPages > 5 && currentPage > 3) {
                       p = currentPage - 2 + i;
                       if (p > totalPages) return null; 
                   }
                   
                   return (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          currentPage === p
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                   );
                })}
             </div>
             <button
               onClick={() => handlePageChange(currentPage + 1)}
               disabled={currentPage === totalPages}
               className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
             >
               <Icons.ChevronRight className="w-4 h-4" />
             </button>
           </div>
        </div>
      )}
    </div>
  );
};