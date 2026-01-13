import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { quotation } = useQuotation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock data combined with current project
  const projects = [
    { 
      id: 'curr', 
      title: quotation.project.name || 'Nykyinen luonnos', 
      customer: quotation.customer.name, 
      date: quotation.project.offerDate || new Date(), 
      status: quotation.status 
    },
    { id: '101', title: 'Loma-asunto Levi', customer: 'Matti Meikäläinen', date: new Date(new Date().setDate(new Date().getDate() - 2)), status: 'sent' },
    { id: '102', title: 'Rivitalo Espoo', customer: 'Rakennus Oy', date: new Date(new Date().setDate(new Date().getDate() - 5)), status: 'awaiting_approval' },
    { id: '103', title: 'Autotalli', customer: 'Teppo Testaaja', date: new Date(new Date().setDate(new Date().getDate() - 12)), status: 'accepted' },
    { id: '105', title: 'Paritalo Vantaa', customer: 'Urakoitsija X', date: new Date(new Date().setDate(new Date().getDate() + 5)), status: 'sent' },
    { id: '106', title: 'Varastohalli Pori', customer: 'Logistiikka Oy', date: new Date(new Date().setDate(new Date().getDate() + 14)), status: 'draft' },
  ];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start (0=Mon, 6=Sun)
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu',
    'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'
  ];

  const weekDays = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'draft': return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'sent': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
        case 'awaiting_approval': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm z-10">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <CalendarIcon className="text-blue-600" /> Kalenteri
            </h1>
            <p className="text-slate-500 text-sm mt-1">Projektien aikataulut ja tarjouspäivämäärät.</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-900 w-32 text-center select-none">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-slate-100 divide-y">
                {/* Empty cells for prev month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-slate-50/30"></div>
                ))}

                {/* Days of current month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    
                    // Find projects for this day
                    const dayProjects = projects.filter(p => {
                        const d = new Date(p.date);
                        return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year;
                    });

                    return (
                        <div key={dayNum} className={`min-h-[120px] p-2 relative group hover:bg-slate-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                            <div className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                                {dayNum}
                            </div>
                            
                            <div className="space-y-1.5">
                                {dayProjects.map((proj, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`text-xs p-2 rounded-md border shadow-sm cursor-pointer hover:shadow-md transition-all ${getStatusColor(proj.status)}`}
                                    >
                                        <div className="font-bold truncate">{proj.title}</div>
                                        <div className="flex items-center gap-1 opacity-75 mt-0.5 truncate">
                                            <User size={10} /> {proj.customer}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                
                {/* Fill remaining cells if needed (optional aesthetic) */}
                {Array.from({ length: 42 - (daysInMonth + firstDay) }).map((_, i) => (
                     <div key={`end-empty-${i}`} className="bg-slate-50/30"></div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;