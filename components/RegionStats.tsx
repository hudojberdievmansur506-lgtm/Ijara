import React, { useMemo } from 'react';
import { Student } from '../types';
import { Icons } from './Icons';

interface RegionStatsProps {
  students: Student[];
}

export const RegionStats: React.FC<RegionStatsProps> = ({ students }) => {
  const data = useMemo(() => {
    const stats: Record<string, { 
      name: string; 
      total: number; 
      men: number; 
      women: number; 
      faculties: Record<string, number> 
    }> = {};

    students.forEach(s => {
      if (!stats[s.city]) {
        stats[s.city] = { name: s.city, total: 0, men: 0, women: 0, faculties: {} };
      }
      const region = stats[s.city];
      region.total++;
      if (s.gender === 'Erkak') region.men++; else region.women++;
      
      region.faculties[s.faculty] = (region.faculties[s.faculty] || 0) + 1;
    });

    return Object.values(stats)
      .map(r => {
        const topFacultyEntry = Object.entries(r.faculties).sort((a, b) => b[1] - a[1])[0];
        return {
          ...r,
          topFaculty: topFacultyEntry ? topFacultyEntry[0] : '-'
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [students]);

  if (students.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-fade-in-down">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Icons.MapPin className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Hududlar (Shahar/Tuman) Kesimida Hisobot</h3>
          <p className="text-xs text-gray-500">Talabalarning yashash hududi bo'yicha taqsimoti</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Hudud Nomi</th>
              <th className="px-6 py-4 text-center">Jami Talaba</th>
              <th className="px-6 py-4">Jinsi</th>
              <th className="px-6 py-4">Asosiy Fakultet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-800">{row.name}</td>
                <td className="px-6 py-4 text-center">
                   <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {row.total}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col w-32 gap-1">
                     <div className="flex justify-between text-[10px] text-gray-500">
                        <span className="text-blue-700 font-bold">{row.men} Erkak</span>
                        <span className="text-yellow-600 font-bold">{row.women} Ayol</span>
                     </div>
                     <div className="w-full bg-yellow-400 h-1.5 rounded-full overflow-hidden flex">
                        <div className="bg-blue-600 h-full" style={{ width: `${(row.men / row.total) * 100}%` }}></div>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 text-xs truncate max-w-[200px]" title={row.topFaculty}>
                  {row.topFaculty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};