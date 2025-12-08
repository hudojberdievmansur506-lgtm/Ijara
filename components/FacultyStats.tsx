import React, { useMemo } from 'react';
import { Student } from '../types';
import { Icons } from './Icons';

interface FacultyStatsProps {
  students: Student[];
}

interface FacultyReport {
  name: string;
  total: number;
  men: number;
  women: number;
  courses: Record<string, number>;
  topRegion: string;
}

export const FacultyStats: React.FC<FacultyStatsProps> = ({ students }) => {
  const reportData = useMemo(() => {
    const stats: Record<string, FacultyReport> = {};

    students.forEach(student => {
      if (!stats[student.faculty]) {
        stats[student.faculty] = {
          name: student.faculty,
          total: 0,
          men: 0,
          women: 0,
          courses: {},
          topRegion: ''
        };
      }

      const facultyStat = stats[student.faculty];
      facultyStat.total++;
      
      // Gender stats
      if (student.gender === 'Erkak') facultyStat.men++;
      else facultyStat.women++;

      // Course stats
      const courseKey = student.course.split('-')[0]; // "1-kurs" -> "1"
      facultyStat.courses[courseKey] = (facultyStat.courses[courseKey] || 0) + 1;
    });

    // Calculate top region for each faculty (simplified)
    Object.values(stats).forEach(stat => {
      const regionCounts: Record<string, number> = {};
      students
        .filter(s => s.faculty === stat.name)
        .forEach(s => {
          regionCounts[s.city] = (regionCounts[s.city] || 0) + 1;
        });
      
      const sortedRegions = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
      stat.topRegion = sortedRegions.length > 0 ? sortedRegions[0][0] : '-';
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
  }, [students]);

  if (students.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8 animate-fade-in-down">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center gap-3">
        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
          <Icons.ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Fakultetlar Kesimida Hisobot</h3>
          <p className="text-xs text-gray-500">Jami ijara talabalari taqsimoti</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 tracking-wider">Fakultet Nomi</th>
              <th className="px-6 py-4 tracking-wider text-center">Jami</th>
              <th className="px-6 py-4 tracking-wider">Jinsi (Erkak/Ayol)</th>
              <th className="px-6 py-4 tracking-wider">Kurslar (1/2/3/4/Mag)</th>
              <th className="px-6 py-4 tracking-wider">Asosiy Hudud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {reportData.map((faculty, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-800">
                  {faculty.name}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {faculty.total}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col w-full max-w-[120px]">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span className="text-blue-700 font-bold">{faculty.men} E</span>
                        <span className="text-yellow-600 font-bold">{faculty.women} A</span>
                      </div>
                      {/* Background is Yellow (Women), Overlay is Blue (Men) */}
                      <div className="w-full bg-yellow-400 h-2 rounded-full overflow-hidden flex border border-gray-100">
                        <div 
                          className="bg-blue-600 h-full" 
                          style={{ width: `${(faculty.men / faculty.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                      {Math.round((faculty.men / faculty.total) * 100)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5">
                    {['1', '2', '3', '4'].map(course => (
                      <div key={course} className={`flex flex-col items-center justify-center w-6 h-7 rounded border ${faculty.courses[course] ? 'bg-white border-gray-300' : 'bg-gray-50 border-transparent opacity-40'}`}>
                        <span className="text-[9px] text-gray-400 leading-none">{course}</span>
                        <span className="text-[10px] font-bold text-gray-800 leading-none">{faculty.courses[course] || 0}</span>
                      </div>
                    ))}
                     <div className={`flex flex-col items-center justify-center w-8 h-7 rounded border ${faculty.courses['Magistratura'] ? 'bg-white border-gray-300' : 'bg-gray-50 border-transparent opacity-40'}`}>
                        <span className="text-[9px] text-gray-400 leading-none">M</span>
                        <span className="text-[10px] font-bold text-gray-800 leading-none">
                            {(faculty.courses['Magistratura 1'] || 0) + (faculty.courses['Magistratura 2'] || 0)}
                        </span>
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                      <Icons.MapPin className="w-3 h-3" />
                      {faculty.topRegion.replace('tumani', 't.').replace('shahri', 'sh.')}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};