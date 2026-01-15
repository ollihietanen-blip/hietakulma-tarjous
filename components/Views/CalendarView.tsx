import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Circle } from 'lucide-react';

const CalendarView: React.FC = () => {
  const { quotation } = useQuotation();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock data combined with current project
  // Added production/installation dates to mock data for visualization
  const projects = [
    { 
      id: 'curr', 
      title: quotation.project.name || 'Nykyinen luonnos', 
      customer: quotation.customer.name, 
      date: quotation.project.offerDate || new Date(), 
      status: quotation.status,
      productionStart: quotation.schedule?.productionStart,
      productionEnd: quotation.schedule?.productionEnd,
      installationStart: quotation.schedule?.installationStart,
      installationEnd: quotation.schedule?.installationEnd,
    },
    { 
      id: '101', 
      title: 'Loma-asunto Levi', 
      customer: 'Matti Meikäläinen', 
      date: new Date(new Date().setDate(new Date().getDate() - 2)), 
      status: 'sent',
      productionStart: new Date(new Date().setDate(new Date().getDate() + 5)),
      productionEnd: new Date(new Date().setDate(new Date().getDate() + 10)),
    },
    { 
      id: '105', 
      title: 'Paritalo Vantaa', 
      customer: 'Urakoitsija X', 
      date: new Date(new Date().setDate(new Date().getDate() + 5)), 
      status: 'sent',
      installationStart: new Date(new Date().setDate(new Date().getDate() + 15)),
      installationEnd: new Date(new Date().setDate(new Date().getDate() + 20)),
    },
  ];

  // Helper to calculate ISO week number
  const getWeekNumber = (d: Date) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

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

  // Calculate Weeks for display
  const totalSlots = firstDay + daysInMonth;
  const rows = Math.ceil(totalSlots / 7);
  const weekNumbers = [];
  
  // Determine the date of the first cell in the grid (can be previous month)
  const gridStartDate = new Date(year, month, 1);
  gridStartDate.setDate(gridStartDate.getDate() - firstDay);

  for (let i = 0; i < rows; i++) {
      const weekDate = new Date(gridStartDate);
      weekDate.setDate(gridStartDate.getDate() + (i * 7));
      weekNumbers.push(getWeekNumber(weekDate));
  }

  // Helper to check if a date falls within a range
  const isWithinRange = (checkDate: Date, start?: Date, end?: Date) => {
      if (!start || !end) return false;
      const d = new Date(checkDate).setHours(0,0,0,0);
      const s = new Date(start).setHours(0,0,0,0);
      const e = new Date(end).setHours(0,0,0,0);
      return d >= s && d <= e;
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.getDate() === d2.getDate() && 
             d1.getMonth() === d2.getMonth() && 
             d1.getFullYear() === d2.getFullYear();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 flex justify-between items-center card-shadow z-10">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <CalendarIcon className="text-hieta-blue" /> Kalenteri
            </h1>
            <p className="text-slate-500 text-sm mt-1">Projektien aikataulut, tuotanto ja asennus.</p>
        </div>
        <div className="flex items-center gap-4 bg-hieta-wood-light/30 p-1.5 rounded-lg border border-slate-200">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover-lift rounded-md transition-all duration-200 text-slate-600 card-shadow">
            <ChevronLeft size={20} />
          </button>
          <span className="font-bold text-slate-900 w-32 text-center select-none">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white hover-lift rounded-md transition-all duration-200 text-slate-600 card-shadow">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-2 bg-white flex gap-6 text-xs font-bold border-b border-slate-100">
          <div className="flex items-center gap-1.5"><Circle size={8} className="text-hieta-blue fill-current" /> Tarjous jätetty</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-200 rounded-sm"></div> Tuotanto</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-purple-200 rounded-sm"></div> Asennus</div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="bg-white rounded-xl card-shadow-lg border border-slate-200 overflow-hidden h-full flex">
            
            {/* Left Column: Week Numbers */}
            <div className="w-12 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="py-3 text-center text-xs font-bold text-slate-400 border-b border-slate-200 uppercase tracking-wider h-[41px] flex items-center justify-center">
                    Vko
                </div>
                <div className="flex-1 flex flex-col divide-y divide-slate-200">
                    {weekNumbers.map((week, idx) => (
                        <div key={idx} className="flex-1 min-h-[120px] flex items-center justify-center text-xs font-bold text-slate-400 bg-slate-100/50">
                            {week}
                        </div>
                    ))}
                    {/* Filler to match potential empty row at bottom of days grid */}
                    <div className="flex-1 bg-slate-50"></div>
                </div>
            </div>

            {/* Right Column: Days Grid */}
            <div className="flex-1 flex flex-col">
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
                        const cellDate = new Date(year, month, dayNum);
                        const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                        
                        return (
                            <div key={dayNum} className={`min-h-[120px] p-2 relative group hover:bg-hieta-wood-light/30 transition-all duration-200 ${isToday ? 'bg-hieta-blue/10' : ''}`}>
                                <div className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-hieta-blue text-white' : 'text-slate-700'}`}>
                                    {dayNum}
                                </div>
                                
                                <div className="space-y-1.5 relative">
                                    {projects.map((proj, idx) => {
                                        const isOfferDay = isSameDay(new Date(proj.date), cellDate);
                                        const isProduction = isWithinRange(cellDate, proj.productionStart, proj.productionEnd);
                                        const isInstallation = isWithinRange(cellDate, proj.installationStart, proj.installationEnd);

                                        if (!isOfferDay && !isProduction && !isInstallation) return null;

                                        return (
                                            <div key={idx} className="text-xs mb-1">
                                                {isOfferDay && (
                                                    <div className="flex items-center gap-1 text-slate-600 mb-1">
                                                        <Circle size={6} className="text-hieta-blue fill-current" />
                                                        <span className="truncate font-medium">{proj.title}</span>
                                                    </div>
                                                )}
                                                
                                                {isProduction && (
                                                    <div className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-sm truncate text-[10px] font-medium border border-orange-200 mb-0.5" title={`Tuotanto: ${proj.title}`}>
                                                        T: {proj.title}
                                                    </div>
                                                )}

                                                {isInstallation && (
                                                    <div className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-sm truncate text-[10px] font-medium border border-purple-200" title={`Asennus: ${proj.title}`}>
                                                        A: {proj.title}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
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
    </div>
  );
};

export default CalendarView;
