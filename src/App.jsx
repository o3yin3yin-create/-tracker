import { SlidersHorizontal, Target, Check, Plus, Trash2, Edit2, X, Home, BarChart2, ChevronDown, ChevronUp, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Custom Hook for Animated Score ---
function useAnimatedScore(targetValue) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 600; 
    const startValue = currentValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutProgress = progress * (2 - progress);
      setCurrentValue(startValue + (targetValue - startValue) * easeOutProgress);
      if (progress < 1) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue]);

  return currentValue;
}

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  // --- Force Status Bar Color on Mobile ---
  useEffect(() => {
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.name = "theme-color";
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = "#000000";
  }, []);

  // --- States (v3 for new data structure) ---
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('daybase_habits_v3');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Workout', type: 'single', subItems: [] },
      { id: '2', name: 'Prayers', type: 'multi', subItems: ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] }
    ];
  });

  const [dailyData, setDailyData] = useState(() => {
    const saved = localStorage.getItem('daybase_dailyData_v3');
    return saved ? JSON.parse(saved) : {};
  });

  const [sleepData, setSleepData] = useState(() => {
    const saved = localStorage.getItem('daybase_sleepData_v3');
    return saved ? JSON.parse(saved) : {};
  });

  const [mission, setMission] = useState(() => {
    return localStorage.getItem('daybase_mission_v3') || "";
  });

  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('daybase_themeColor') || '#FF9F0A';
  });

  const [expandedHabits, setExpandedHabits] = useState([]);

  // --- Refs ---
  const chartRef = useRef(null);
  const topRef = useRef(null);

  // --- Date Logic ---
  const [baseDate, setBaseDate] = useState(new Date());

  const dayName = baseDate.toLocaleString('en-US', { weekday: 'long' }); 
  const dayNum = String(baseDate.getDate()).padStart(2, '0'); 
  
  const getFormatDateStr = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const activeDateStr = getFormatDateStr(baseDate);
  const realTodayStr = getFormatDateStr(new Date());

  // Date Nav Functions
  const handlePrevDay = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDay = () => {
    setBaseDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const handleToday = () => {
    setBaseDate(new Date());
  };

  // --- Modals & Inputs ---
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [missionInput, setMissionInput] = useState(mission);
  
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false); 
  
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitType, setNewHabitType] = useState('single');
  const [newHabitSubItems, setNewHabitSubItems] = useState(['', '']);

  const [sleepInput, setSleepInput] = useState("");

  // Sync sleep input when date changes
  useEffect(() => {
    setSleepInput(sleepData[activeDateStr] || "");
  }, [activeDateStr, sleepData]);

  // --- Effects ---
  useEffect(() => { localStorage.setItem('daybase_habits_v3', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('daybase_dailyData_v3', JSON.stringify(dailyData)); }, [dailyData]);
  useEffect(() => { localStorage.setItem('daybase_sleepData_v3', JSON.stringify(sleepData)); }, [sleepData]);
  useEffect(() => { localStorage.setItem('daybase_mission_v3', mission); }, [mission]);
  useEffect(() => { localStorage.setItem('daybase_themeColor', themeColor); }, [themeColor]);

  // --- Functions ---
  const toggleCheck = (habitId, subItem = null) => {
    const key = subItem ? `${activeDateStr}-${habitId}-${subItem}` : `${activeDateStr}-${habitId}`;
    setDailyData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleExpand = (habitId) => {
    setExpandedHabits(prev => 
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const saveMission = () => {
    setMission(missionInput);
    setIsEditingMission(false);
  };

  const logSleep = () => {
    if (sleepInput === "") {
       const newData = {...sleepData};
       delete newData[activeDateStr];
       setSleepData(newData);
    } else if (!isNaN(sleepInput)) {
      setSleepData(prev => ({ ...prev, [activeDateStr]: parseFloat(sleepInput) }));
    }
  };

  // Add Habit Logic
  const handleAddSubItem = () => setNewHabitSubItems([...newHabitSubItems, '']);
  const updateSubItem = (index, val) => {
    const arr = [...newHabitSubItems];
    arr[index] = val;
    setNewHabitSubItems(arr);
  };
  const removeSubItem = (index) => {
    setNewHabitSubItems(newHabitSubItems.filter((_, i) => i !== index));
  };

  const confirmAddHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit = {
      id: generateId(),
      name: newHabitName.trim(),
      type: newHabitType,
      subItems: newHabitType === 'multi' ? newHabitSubItems.filter(s => s.trim() !== '') : []
    };
    setHabits([...habits, newHabit]);
    setNewHabitName("");
    setNewHabitType('single');
    setNewHabitSubItems(['', '']);
    setIsAddOpen(false);
  };

  const deleteHabit = (habitId) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  // --- Score Calculations ---
  let totalPossible = 0;
  let totalCompleted = 0;

  habits.forEach(h => {
    if (h.type === 'single') {
      totalPossible += 1;
      if (dailyData[`${activeDateStr}-${h.id}`]) totalCompleted += 1;
    } else {
      totalPossible += h.subItems.length;
      h.subItems.forEach(sub => {
        if (dailyData[`${activeDateStr}-${h.id}-${sub}`]) totalCompleted += 1;
      });
    }
  });

  const targetScore = totalPossible === 0 ? 0 : (totalCompleted / totalPossible) * 100;
  const animatedScore = useAnimatedScore(targetScore);
  const scoreDisplay = animatedScore % 1 === 0 ? animatedScore.toFixed(0) : animatedScore.toFixed(1);

  // --- Sleep Chart Data Prep ---
  const getChartData = () => {
    const data = [];
    const dayNames = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
    const curr = new Date(baseDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); 
    const startOfWeek = new Date(curr.setDate(diff));

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const currentStr = getFormatDateStr(currentDay);

      let dayTotal = 0;
      let dayComp = 0;
      habits.forEach(h => {
        if (h.type === 'single') {
          dayTotal += 1;
          if (dailyData[`${currentStr}-${h.id}`]) dayComp += 1;
        } else {
          dayTotal += h.subItems.length;
          h.subItems.forEach(sub => {
            if (dailyData[`${currentStr}-${h.id}-${sub}`]) dayComp += 1;
          });
        }
      });
      const dayScore = dayTotal > 0 ? (dayComp / dayTotal) * 100 : 0;

      data.push({
        name: dayNames[i],
        sleep: sleepData[currentStr] || 0,
        score: dayScore
      });
    }
    return data;
  };

  const sleepChartData = getChartData();

  return (
    <>
      <style>
        {`
          body, html, #root {
            background-color: #000000 !important;
            margin: 0;
            padding: 0;
          }
        `}
      </style>
      <div className="min-h-screen bg-black text-white font-sans flex justify-center w-full selection:bg-white/20 pb-28">
        <div ref={topRef} /> 
        
        {/* ---------------- ADD HABIT MODAL ---------------- */}
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-sm p-6 bg-[#1C1C1E] rounded-[2rem] border border-white/10 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Habit</h2>
                <button onClick={() => setIsAddOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></button>
              </div>
              
              <input type="text" placeholder="Habit Name (e.g., Prayers)" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} className="w-full bg-black text-white px-4 py-4 rounded-2xl outline-none border border-white/10 focus:border-white/30 mb-4 font-medium" />
              
              <div className="flex bg-black rounded-2xl p-1 mb-6 border border-white/10">
                <button onClick={() => setNewHabitType('single')} className={`flex-1 py-3 rounded-xl font-medium transition-colors ${newHabitType === 'single' ? 'bg-[#2C2C2E]' : 'text-white/50'}`}>Single</button>
                <button onClick={() => setNewHabitType('multi')} className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${newHabitType === 'multi' ? 'bg-[#2C2C2E]' : 'text-white/50'}`}><ListChecks size={18}/> Checklist</button>
              </div>

              {newHabitType === 'multi' && (
                <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <p className="text-sm text-white/50 mb-2">Add your sub-tasks:</p>
                  {newHabitSubItems.map((sub, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" placeholder={`Task ${idx + 1}...`} value={sub} onChange={(e) => updateSubItem(idx, e.target.value)} className="flex-1 bg-black text-white px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-white/30 text-sm" />
                      <button onClick={() => removeSubItem(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20"><X size={16} /></button>
                    </div>
                  ))}
                  <button onClick={handleAddSubItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-white/50 hover:text-white hover:border-white/40 text-sm font-medium">+ Add Item</button>
                </div>
              )}

              <button onClick={confirmAddHabit} className="w-full py-4 rounded-2xl font-bold text-lg" style={{backgroundColor: themeColor, color: '#000'}}>Create Habit</button>
            </div>
          </div>
        )}

        {/* ---------------- MANAGE HABITS MODAL ---------------- */}
        {isManageOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-sm p-6 bg-[#1C1C1E] rounded-[2rem] border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage</h2>
                <button onClick={() => setIsManageOpen(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20} /></button>
              </div>
              
              <button onClick={() => {setIsManageOpen(false); setIsAddOpen(true);}} className="w-full py-4 mb-6 rounded-2xl font-bold flex justify-center items-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10">
                <Plus size={20}/> Add New Habit
              </button>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {habits.map(h => (
                  <div key={h.id} className="flex items-center gap-2">
                    <div className="flex-1 bg-black text-white px-4 py-3 rounded-2xl truncate flex items-center justify-between">
                      <span>{h.name}</span>
                      {h.type === 'multi' && <span className="text-[10px] bg-white/10 px-2 py-1 rounded-md text-white/50">{h.subItems.length} items</span>}
                    </div>
                    <button onClick={() => deleteHabit(h.id)} className="p-3 bg-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/40"><Trash2 size={16} /></button>
                  </div>
                ))}
                {habits.length === 0 && <p className="text-center text-white/40 py-4">No habits yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- MAIN APP UI ---------------- */}
        <div className="w-full max-w-[428px] h-full flex flex-col pt-12 px-5 relative">
          
          {/* Header with Navigation */}
          <header className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-medium tracking-tight flex gap-2 items-center">
                {dayName} <span className="text-white/40">{dayNum}</span>
              </h1>
              
              {/* Date Navigation Controls */}
              <div className="flex items-center gap-2">
                <button onClick={handlePrevDay} className="p-1.5 bg-[#1C1C1E] rounded-full text-white/50 hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={handleNextDay} className="p-1.5 bg-[#1C1C1E] rounded-full text-white/50 hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </button>
                {activeDateStr !== realTodayStr && (
                  <button onClick={handleToday} className="text-[10px] font-bold tracking-widest uppercase bg-[#1C1C1E] px-3 py-1.5 rounded-full text-white/70 hover:text-white transition-colors">
                    Today
                  </button>
                )}
              </div>
            </div>
            
            <label className="text-white/60 hover:text-white transition-colors cursor-pointer relative mt-1">
              <SlidersHorizontal size={24} strokeWidth={2} />
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
            </label>
          </header>

          {/* Mission Card */}
          <div className="w-full p-6 flex flex-col mb-8 transition-colors duration-500" style={{ backgroundColor: themeColor, borderRadius: '28px', color: '#000000' }}>
            {mission ? (
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} strokeWidth={2.5} />
                <span className="text-xs font-bold tracking-widest uppercase">My Mission</span>
              </div>
            ) : (
              <button onClick={() => setIsEditingMission(true)} className="flex items-center gap-2 mb-2 hover:opacity-70">
                <Target size={16} strokeWidth={2.5} />
                <span className="text-xs font-bold tracking-widest uppercase">Set Mission</span>
              </button>
            )}
            
            {isEditingMission ? (
              <input 
                autoFocus value={missionInput} onChange={(e) => setMissionInput(e.target.value)} onBlur={saveMission} onKeyDown={(e) => e.key === 'Enter' && saveMission()}
                className="text-3xl font-extrabold tracking-tighter outline-none bg-transparent mb-6 pb-1 border-b border-black/20 w-full"
                style={{ color: '#000000' }} placeholder="What's your goal?"
              />
            ) : (
              mission && (
                <h2 onClick={() => setIsEditingMission(true)} className="text-3xl font-extrabold tracking-tighter mb-6 cursor-pointer break-words">
                  {mission}
                </h2>
              )
            )}

            <div className="w-full h-[3px] bg-black/10 mb-4 rounded-full overflow-hidden">
              <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${animatedScore}%` }}></div>
            </div>

            <div className="flex gap-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold tracking-widest opacity-60 uppercase mb-1">Score ({activeDateStr === realTodayStr ? 'Today' : 'Viewed'})</span>
                <span className="text-4xl font-bold tracking-tighter">{scoreDisplay}<span className="text-2xl font-medium">%</span></span>
              </div>
            </div>
          </div>

          {/* ---------------- HABITS GRID ---------------- */}
          <div className="grid grid-cols-2 gap-3 mb-10 items-start">
            {habits.map((habit) => {
              const isMulti = habit.type === 'multi';
              const isExpanded = expandedHabits.includes(habit.id);
              
              let isAllChecked = false;
              let checkedCount = 0;

              if (isMulti) {
                checkedCount = habit.subItems.filter(sub => dailyData[`${activeDateStr}-${habit.id}-${sub}`]).length;
                isAllChecked = checkedCount === habit.subItems.length && habit.subItems.length > 0;
              } else {
                isAllChecked = dailyData[`${activeDateStr}-${habit.id}`];
              }

              const gridClass = (isMulti && isExpanded) ? 'col-span-2' : 'col-span-1';
              
              return (
                <div
                  key={habit.id}
                  className={`relative flex flex-col transition-all duration-300 ${gridClass}`}
                  style={{ 
                    borderRadius: '20px',
                    backgroundColor: isAllChecked ? themeColor : '#1C1C1E',
                    color: isAllChecked ? '#000000' : '#FFFFFF',
                    aspectRatio: (isMulti && isExpanded) ? 'auto' : '2.5 / 1',
                    minHeight: (isMulti && isExpanded) ? 'auto' : '0'
                  }}
                >
                  <div 
                    onClick={() => isMulti ? toggleExpand(habit.id) : toggleCheck(habit.id)}
                    className="flex items-center justify-between p-4 h-full cursor-pointer"
                  >
                    <div className="flex flex-col flex-1 pr-2 overflow-hidden">
                      <span className="text-[15px] font-medium leading-tight truncate">{habit.name}</span>
                      {isMulti && !isExpanded && (
                        <span className="text-[10px] opacity-60 mt-0.5 font-bold tracking-wider">{checkedCount}/{habit.subItems.length}</span>
                      )}
                    </div>
                    
                    {isMulti ? (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-black/20 text-current">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: isAllChecked ? 'transparent' : '#2C2C2E' }}>
                        {isAllChecked ? <Check size={16} strokeWidth={3} style={{ color: '#000000' }} /> : <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    )}
                  </div>

                  {isMulti && isExpanded && (
                    <div className="flex flex-col gap-2 px-4 pb-4 pt-1 border-t border-black/10">
                      {habit.subItems.map((sub, idx) => {
                        const isSubChecked = dailyData[`${activeDateStr}-${habit.id}-${sub}`];
                        return (
                          <div 
                            key={idx} 
                            onClick={() => toggleCheck(habit.id, sub)}
                            className="flex justify-between items-center p-3 rounded-xl cursor-pointer transition-colors"
                            style={{ backgroundColor: isAllChecked ? 'rgba(0,0,0,0.1)' : '#2C2C2E' }}
                          >
                            <span className="text-sm font-medium">{sub}</span>
                            <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ borderColor: isSubChecked ? (isAllChecked ? '#000' : themeColor) : 'rgba(255,255,255,0.2)', backgroundColor: isSubChecked ? (isAllChecked ? '#000' : themeColor) : 'transparent' }}>
                              {isSubChecked && <Check size={12} strokeWidth={4} style={{ color: isAllChecked ? themeColor : '#000' }} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- SLEEP VS SCORE CHART SECTION --- */}
          <div ref={chartRef} className="mt-4 mb-4 pt-4">
            <div className="flex justify-between items-center mb-8 px-1">
              <h3 className="text-2xl font-medium">Log Sleep (Hrs)</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="0" value={sleepInput} onChange={(e) => setSleepInput(e.target.value)} className="w-16 bg-[#1C1C1E] text-white px-2 py-2 rounded-xl outline-none text-center font-medium" />
                <button onClick={logSleep} className="bg-white text-black px-4 py-2 rounded-xl font-bold text-sm">Save</button>
              </div>
            </div>

            <div className="w-full p-6 bg-[#1C1C1E] rounded-[2rem]">
              <h3 className="text-lg font-medium mb-8">Sleep vs Score</h3>
              <div className="w-full h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepChartData} barGap={4}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 600 }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" hide domain={[0, 24]} />
                    <YAxis yAxisId="right" orientation="right" hide domain={[0, 100]} />
                    <Tooltip cursor={{fill: '#2C2C2E'}} contentStyle={{ backgroundColor: '#000000', border: 'none', borderRadius: '12px', color: '#FFFFFF' }} itemStyle={{ color: '#FFFFFF', fontWeight: 600 }} formatter={(value, name) => { if (name === "Sleep") return [`${value} hrs`, "Sleep"]; return [`${value.toFixed(0)}%`, "Score"]; }} />
                    <Bar yAxisId="left" dataKey="sleep" fill="#FFFFFF" radius={[4, 4, 4, 4]} barSize={6} name="Sleep" />
                    <Bar yAxisId="right" dataKey="score" fill={themeColor} radius={[4, 4, 4, 4]} barSize={6} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white"/><span className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase">SLEEP (HRS)</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: themeColor}}/><span className="text-[10px] font-bold tracking-widest text-[#8E8E93] uppercase">SCORE (%)</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* --- CREATOR SIGNATURE (6AFRA INSTAGRAM LINK) --- */}
          <div className="flex justify-center items-center mt-6 mb-8 opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold tracking-widest uppercase">
              This tracker crafted in Egypt by <a href="https://www.instagram.com/jj3_xx?igsh=MWVkaGI5ZjNsb3Nreg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" style={{ color: themeColor }} className="underline decoration-dashed underline-offset-4 font-bold">6afra</a>
            </span>
          </div>

          {/* --- FLOATING NAV --- */}
          <div className="fixed bottom-0 left-0 w-full flex justify-center pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent pointer-events-none">
            <div className="w-full max-w-[428px] px-6 flex justify-between items-center pointer-events-auto">
              <div className="bg-[#1C1C1E] rounded-full flex items-center p-2 gap-2 shadow-2xl">
                <button onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#2C2C2E] text-white transition-colors"><Home size={20} /></button>
                <button onClick={() => chartRef.current?.scrollIntoView({ behavior: 'smooth' })} className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-[#2C2C2E] text-white/50 transition-colors"><BarChart2 size={20} /></button>
              </div>
              <button onClick={() => setIsManageOpen(true)} className="w-14 h-14 rounded-full bg-[#1C1C1E] flex items-center justify-center hover:bg-[#2C2C2E] transition-colors shadow-2xl border border-white/5"><Edit2 size={22} className="text-white/80" /></button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default App;