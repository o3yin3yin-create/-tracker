import { User, Moon, Sun, Plus, Check, X, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('6afra_habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [monthlyData, setMonthlyData] = useState(() => {
    const saved = localStorage.getItem('6afra_monthlyData');
    return saved ? JSON.parse(saved) : {};
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('6afra_isDarkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const [username, setUsername] = useState(() => {
    return localStorage.getItem('6afra_username') || "";
  });

  useEffect(() => {
    localStorage.setItem('6afra_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('6afra_monthlyData', JSON.stringify(monthlyData));
  }, [monthlyData]);

  useEffect(() => {
    localStorage.setItem('6afra_isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const [baseDate, setBaseDate] = useState(new Date());

  const isLoginOpen = !localStorage.getItem('6afra_username'); 
  const [loginInput, setLoginInput] = useState("");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState("");
  const [editedHabitName, setEditedHabitName] = useState("");

  const monthName = baseDate.toLocaleString('en-US', { month: 'short' }); // خليتها short عشان الموبايل
  const currentYear = baseDate.getFullYear();
  const viewDay = baseDate.getDate();

  const realToday = new Date();

  const getFormatDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const realTodayStr = getFormatDateStr(realToday);

  const getCurrentWeekDays = () => {
    const weekDays = [];
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayOfWeek = baseDate.getDay();
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push({
        name: names[i],
        dayNum: day.getDate(),
        fullDateStr: getFormatDateStr(day) 
      });
    }
    return weekDays;
  };

  const currentWeek = getCurrentWeekDays();
  const [activeDateStr, setActiveDateStr] = useState(null);

  const handlePrevWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() - 7);
    setBaseDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + 7);
    setBaseDate(newDate);
  };

  const handleToday = () => {
    setBaseDate(new Date());
  };

  const handleLogin = () => {
    if (loginInput.trim() !== "") {
      localStorage.setItem('6afra_username', loginInput.trim());
      setUsername(loginInput.trim());
      window.location.reload(); 
    }
  };

  const confirmAddHabit = () => {
    if (newHabitName.trim() !== "") {
      if (!habits.includes(newHabitName.trim())) {
        setHabits([...habits, newHabitName.trim()]);
        setIsAddModalOpen(false);
        setNewHabitName("");
      } else {
        alert("This habit already exists_");
      }
    }
  };

  const deleteHabit = (habitName) => {
    setHabits(habits.filter(h => h !== habitName));
  };

  const openEditModal = (habitName) => {
    setHabitToEdit(habitName);
    setEditedHabitName(habitName);
    setIsEditModalOpen(true);
  };

  const confirmEditHabit = () => {
    if (editedHabitName.trim() !== "" && !habits.includes(editedHabitName.trim())) {
      setHabits(habits.map(h => h === habitToEdit ? editedHabitName.trim() : h));
      
      const newData = {...monthlyData};
      Object.keys(newData).forEach(key => {
        if(key.endsWith(`-${habitToEdit}`)) {
          const newKey = key.replace(`-${habitToEdit}`, `-${editedHabitName.trim()}`);
          newData[newKey] = newData[key];
          delete newData[key];
        }
      });
      setMonthlyData(newData);
      setIsEditModalOpen(false);
    } else if (editedHabitName.trim() === habitToEdit) {
      setIsEditModalOpen(false); 
    } else {
      alert("Invalid or duplicate name_");
    }
  };

  const toggleCheck = (fullDateStr, habit) => {
    const key = `${fullDateStr}-${habit}`;
    setMonthlyData(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getWeeklyChartData = () => {
    return currentWeek.map(day => {
      let completedCount = 0;
      habits.forEach(habit => {
        const key = `${day.fullDateStr}-${habit}`;
        if (monthlyData[key]) completedCount++;
      });
      return {
        name: day.name,
        completed: completedCount
      };
    });
  };

  const chartData = getWeeklyChartData();
  const chartColor = isDarkMode ? '#EFEDE3' : '#302F2C';
  const yAxisMax = Math.max(habits.length, 4);
  const yAxisTicks = Array.from({ length: yAxisMax + 1 }, (_, i) => i);

  return (
    <div 
      className={`min-h-screen bg-dotted font-scribble p-3 sm:p-8 md:p-16 transition-colors duration-300 ${isDarkMode ? 'bg-asphalt text-paper' : 'bg-paper text-asphalt'}`}
      style={isDarkMode ? { backgroundImage: 'radial-gradient(rgba(239, 237, 227, 0.15) 1.5px, transparent 1.5px)' } : {}}
    >
      
      {/* Onboarding Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt/60 backdrop-blur-sm transition-opacity">
          <div className={`relative w-full max-w-sm p-6 md:p-8 rounded-3xl shadow-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-asphalt border-paper/10' : 'bg-paper border-asphalt/10'}`}>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome_</h2>
            <p className={`text-xl md:text-2xl mb-8 ${isDarkMode ? 'text-paper/60' : 'text-asphalt/60'}`}>What should we call you?</p>
            <div className="space-y-6">
              <input 
                type="text" 
                autoFocus
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Your Name" 
                className={`w-full p-3 md:p-4 rounded-xl border-2 bg-transparent outline-none text-2xl md:text-3xl transition-all ${isDarkMode ? 'border-paper/20 focus:border-paper/50 placeholder:text-paper/30' : 'border-asphalt/20 focus:border-asphalt/50 placeholder:text-asphalt/30'}`} 
              />
              <button 
                onClick={handleLogin} 
                className={`w-full py-3 md:py-4 mt-4 rounded-xl text-2xl md:text-3xl font-bold transition-all ${isDarkMode ? 'bg-paper text-asphalt hover:bg-paper/90' : 'bg-asphalt text-paper hover:bg-asphalt/90'}`}
              >
                Start Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsProfileOpen(false)}
        >
          <div 
            className={`relative w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-asphalt border-paper/10' : 'bg-paper border-asphalt/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsProfileOpen(false)}
              className={`absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full transition-all ${isDarkMode ? 'hover:bg-paper/10' : 'hover:bg-asphalt/10'}`}
            >
              <X size={24} strokeWidth={2} />
            </button>
            <div className="flex flex-col items-center mt-2 md:mt-4">
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 mb-4 md:mb-6 flex items-center justify-center ${isDarkMode ? 'border-paper/20' : 'border-asphalt/20'}`}>
                <User size={40} strokeWidth={1.5} className={isDarkMode ? 'text-paper/50' : 'text-asphalt/50'} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-1">{username}_</h2>
              <p className={`text-xl md:text-2xl mb-6 md:mb-8 ${isDarkMode ? 'text-paper/50' : 'text-asphalt/50'}`}>
                Minimalist Tracker
              </p>
              <div className="w-full space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className={`flex justify-between p-3 md:p-4 rounded-xl border ${isDarkMode ? 'bg-paper/5 border-paper/10' : 'bg-asphalt/5 border-asphalt/10'}`}>
                  <span className="text-xl md:text-2xl">Total Habits</span>
                  <span className="text-xl md:text-2xl font-bold">{habits.length}</span>
                </div>
                <div className={`flex justify-between p-3 md:p-4 rounded-xl border ${isDarkMode ? 'bg-paper/5 border-paper/10' : 'bg-asphalt/5 border-asphalt/10'}`}>
                  <span className="text-xl md:text-2xl">Total Completed</span>
                  <span className="text-xl md:text-2xl font-bold">{Object.values(monthlyData).filter(Boolean).length} Checks</span>
                </div>
              </div>
              <div className={`text-lg md:text-xl tracking-widest uppercase opacity-30 ${isDarkMode ? 'text-paper' : 'text-asphalt'}`}>
                System by 6afra
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Habit Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-sm p-6 md:p-8 rounded-3xl shadow-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-asphalt border-paper/10' : 'bg-paper border-asphalt/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">New Habit_</h2>
            <input 
              type="text" 
              autoFocus
              placeholder="E.g. Read 10 pages" 
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmAddHabit()}
              className={`w-full p-3 md:p-4 rounded-xl border-2 bg-transparent outline-none text-2xl md:text-3xl transition-all mb-6 ${isDarkMode ? 'border-paper/20 focus:border-paper/50 placeholder:text-paper/30' : 'border-asphalt/20 focus:border-asphalt/50 placeholder:text-asphalt/30'}`} 
            />
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className={`w-full py-2 md:py-3 rounded-xl text-xl md:text-2xl font-bold transition-all border-2 ${isDarkMode ? 'border-paper/20 hover:border-paper/50' : 'border-asphalt/20 hover:border-asphalt/50'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmAddHabit} 
                className={`w-full py-2 md:py-3 rounded-xl text-xl md:text-2xl font-bold transition-all ${isDarkMode ? 'bg-paper text-asphalt hover:bg-paper/90' : 'bg-asphalt text-paper hover:bg-asphalt/90'}`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className={`relative w-full max-w-sm p-6 md:p-8 rounded-3xl shadow-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-asphalt border-paper/10' : 'bg-paper border-asphalt/10'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Edit Habit_</h2>
            <input 
              type="text" 
              autoFocus
              value={editedHabitName}
              onChange={(e) => setEditedHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmEditHabit()}
              className={`w-full p-3 md:p-4 rounded-xl border-2 bg-transparent outline-none text-2xl md:text-3xl transition-all mb-6 ${isDarkMode ? 'border-paper/20 focus:border-paper/50 placeholder:text-paper/30' : 'border-asphalt/20 focus:border-asphalt/50 placeholder:text-asphalt/30'}`} 
            />
            <div className="flex gap-3 md:gap-4">
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className={`w-full py-2 md:py-3 rounded-xl text-xl md:text-2xl font-bold transition-all border-2 ${isDarkMode ? 'border-paper/20 hover:border-paper/50' : 'border-asphalt/20 hover:border-asphalt/50'}`}
              >
                Cancel
              </button>
              <button 
                onClick={confirmEditHabit} 
                className={`w-full py-2 md:py-3 rounded-xl text-xl md:text-2xl font-bold transition-all ${isDarkMode ? 'bg-paper text-asphalt hover:bg-paper/90' : 'bg-asphalt text-paper hover:bg-asphalt/90'}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-8 md:space-y-16">
        
        <header className={`flex justify-between items-center backdrop-blur-md border rounded-3xl p-4 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-colors duration-300 ${isDarkMode ? 'bg-asphalt/60 border-paper/10' : 'bg-paper/60 border-asphalt/10'}`}>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">Tracker_</h1>
          
          <div className="flex items-center gap-x-2 md:gap-x-6">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className={`flex items-center gap-x-1 md:gap-x-2 py-2 px-3 md:py-3 md:px-6 rounded-full transition-all cursor-pointer text-lg md:text-2xl font-bold ${isDarkMode ? 'bg-paper text-asphalt hover:bg-paper/90' : 'bg-asphalt text-paper hover:bg-asphalt/90'}`}
            >
                <Plus size={18} strokeWidth={2} />
                <span className="hidden sm:inline">New Habit</span>
            </button>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 md:p-4 backdrop-blur-sm rounded-full transition-all cursor-pointer border ${isDarkMode ? 'bg-paper/10 border-paper/10 hover:bg-paper/20 text-paper' : 'bg-paper/40 border-asphalt/10 hover:bg-asphalt/5 text-asphalt'}`}
            >
              {isDarkMode ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
            
            <button 
              onClick={() => setIsProfileOpen(true)}
              className={`p-2 md:p-4 backdrop-blur-sm rounded-full shadow-inner transition-all cursor-pointer border ${isDarkMode ? 'bg-paper/10 border-paper/10 hover:bg-paper/20 text-paper' : 'bg-paper/40 border-asphalt/10 hover:bg-asphalt/5 text-asphalt'}`}
            >
              <User size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="px-2 md:px-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4">
          <div>
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <button onClick={handlePrevWeek} className={`p-1 md:p-2 rounded-full border transition-all ${isDarkMode ? 'border-paper/20 hover:bg-paper/10' : 'border-asphalt/20 hover:bg-asphalt/5'}`}>
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <button onClick={handleNextWeek} className={`p-1 md:p-2 rounded-full border transition-all ${isDarkMode ? 'border-paper/20 hover:bg-paper/10' : 'border-asphalt/20 hover:bg-asphalt/5'}`}>
                <ChevronRight size={20} strokeWidth={2} />
              </button>
              <button onClick={handleToday} className={`ml-1 md:ml-2 px-3 py-1 md:px-4 md:py-2 rounded-full border transition-all text-lg md:text-xl ${isDarkMode ? 'border-paper/20 hover:bg-paper/10' : 'border-asphalt/20 hover:bg-asphalt/5'}`}>
                Today
              </button>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-wide">{monthName} {viewDay}, {currentYear}_</h2>
            {username && (
              <p className={`text-2xl md:text-3xl mt-1 md:mt-2 ${isDarkMode ? 'text-paper/60' : 'text-asphalt/60'}`}>
                Ready to crush it, {username}?
              </p>
            )}
          </div>
          <span className={`text-xl md:text-2xl mb-1 ${isDarkMode ? 'text-paper/40' : 'text-asphalt/40'}`}>Weekly View</span>
        </div>

        <section>
          <div className={`backdrop-blur-md border rounded-3xl p-3 md:p-8 overflow-x-auto shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-colors duration-300 scrollbar-hide ${isDarkMode ? 'bg-asphalt/60 border-paper/10' : 'bg-paper/60 border-asphalt/10'}`}>
            <table className="w-full text-left border-collapse min-w-[500px] md:table-fixed">
              <thead>
                <tr>
                  <th className={`w-16 md:w-32 p-2 md:p-4 border-b-2 text-2xl md:text-4xl font-normal ${isDarkMode ? 'border-paper/10 text-paper/50' : 'border-asphalt/10 text-asphalt/50'}`}>Day</th>
                  {habits.map(habit => (
                    <th key={habit} className={`p-2 md:p-4 border-b-2 text-xl md:text-4xl font-normal text-center leading-none group ${isDarkMode ? 'border-paper/10' : 'border-asphalt/10'}`}>
                      <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
                        <span>{habit}</span>
                        {/* التعديل السحري للموبايل: الأيقونات ظاهرة دايماً بشفافية خفيفة على الموبايل عشان الـ Touch */}
                        <div className="flex gap-2 md:gap-3 opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity mt-1 md:mt-0">
                          <button onClick={() => openEditModal(habit)} className={`hover:opacity-70 transition-opacity ${isDarkMode ? 'text-paper' : 'text-asphalt'}`}>
                            <Edit2 size={14} className="md:w-[18px] md:h-[18px]" />
                          </button>
                          <button onClick={() => deleteHabit(habit)} className="text-red-500 hover:opacity-70 transition-opacity">
                            <Trash2 size={14} className="md:w-[18px] md:h-[18px]" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentWeek.map(day => {
                  const isDayActive = activeDateStr === day.fullDateStr; 
                  const isToday = day.fullDateStr === realTodayStr; 
                  return (
                    <tr key={day.name} className={`group transition-colors ${isToday ? (isDarkMode ? 'bg-paper/10' : 'bg-asphalt/10') : ''} ${isDarkMode ? 'hover:bg-paper/5' : 'hover:bg-asphalt/5'}`}>
                      <td className={`p-2 md:p-4 border-b text-xl md:text-4xl ${isDarkMode ? 'border-paper/5' : 'border-asphalt/5'}`}>
                        <button 
                          onClick={() => setActiveDateStr(isDayActive ? null : day.fullDateStr)} 
                          className={`text-left cursor-pointer transition-colors block w-full focus:outline-none ${isDarkMode ? 'hover:text-paper/70' : 'hover:text-asphalt/70'} ${isToday ? 'font-bold' : ''}`}
                        >
                          {isDayActive ? `${day.dayNum}.` : day.name}
                        </button>
                      </td>
                      
                      {habits.map(habit => {
                        const isChecked = monthlyData[`${day.fullDateStr}-${habit}`]; 
                        return (
                          <td key={`${day.fullDateStr}-${habit}`} className={`p-2 md:p-4 border-b text-center ${isDarkMode ? 'border-paper/5' : 'border-asphalt/5'}`}>
                            <button
                              onClick={() => toggleCheck(day.fullDateStr, habit)} 
                              className={`w-6 h-6 md:w-12 md:h-12 mx-auto rounded-md md:rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                                isChecked 
                                  ? (isDarkMode ? 'bg-paper border-paper text-asphalt' : 'bg-asphalt border-asphalt text-paper') 
                                  : (isDarkMode ? 'border-paper/20 hover:border-paper/50 bg-transparent' : 'border-asphalt/20 hover:border-asphalt/50 bg-transparent')
                              }`}
                            >
                              {isChecked && <Check size={16} strokeWidth={3} className="md:w-7 md:h-7" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {habits.length === 0 && (
              <div className="text-center py-8 md:py-12 text-2xl md:text-3xl opacity-40">
                No habits added yet. Click "+ New Habit"_
              </div>
            )}
          </div>
        </section>

        {/* Statistics Chart */}
        <section className={`backdrop-blur-md border rounded-3xl p-4 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-colors duration-300 ${isDarkMode ? 'bg-asphalt/60 border-paper/10' : 'bg-paper/60 border-asphalt/10'}`}>
          <h2 className={`text-3xl md:text-5xl mb-6 md:mb-8 ${isDarkMode ? 'text-paper/70' : 'text-asphalt/70'}`}>Weekly Analytics_</h2>
          <div className="h-48 md:h-80 w-full text-lg md:text-2xl">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -25 }}>
                <XAxis 
                  dataKey="name" 
                  stroke={chartColor} 
                  opacity={0.5} 
                  tick={{ fontSize: window.innerWidth < 768 ? 16 : 24, fontFamily: 'Reenie Beanie', dy: 10 }} 
                  axisLine={false} 
                  tickLine={false} 
                  padding={{ left: 15, right: 15 }}
                />
                <YAxis 
                  stroke={chartColor} 
                  opacity={0.5} 
                  tick={{ fontSize: window.innerWidth < 768 ? 16 : 24, fontFamily: 'Reenie Beanie' }} 
                  axisLine={false} 
                  tickLine={false} 
                  domain={[0, yAxisMax]} 
                  ticks={yAxisTicks} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDarkMode ? 'rgba(48, 47, 44, 0.8)' : 'rgba(239, 237, 227, 0.8)', backdropFilter: 'blur(4px)', border: `1px solid ${chartColor}`, borderRadius: '1rem', fontFamily: 'Reenie Beanie', fontSize: '20px', color: chartColor }}
                  itemStyle={{ color: chartColor }}
                />
                <Line 
                  type="linear" 
                  dataKey="completed" 
                  stroke={chartColor} 
                  strokeWidth={3} 
                  strokeOpacity={0.4} 
                  dot={{ fill: isDarkMode ? '#302F2C' : '#EFEDE3', stroke: chartColor, strokeWidth: 2, r: window.innerWidth < 768 ? 3 : 4, strokeOpacity: 0.4, fillOpacity: 0.8 }} 
                  activeDot={{ r: window.innerWidth < 768 ? 4 : 6, fill: chartColor }}
                  isAnimationActive={true}
                  animationDuration={200}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;