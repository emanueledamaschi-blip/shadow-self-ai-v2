'use client';

import React, { useState, useEffect } from 'react';
import { Moon, TrendingUp, BookOpen, Brain, Calendar, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthScreen from '../components/AuthScreen';

export default function ShadowSelfApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('checkin');
  const [checkIns, setCheckIns] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [todayCheckIn, setTodayCheckIn] = useState(null);
  const [streak, setStreak] = useState({ current: 0, best: 0 });
  const [accessGranted, setAccessGranted] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      const { data: checkInsData } = await supabase
        .from('check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      setCheckIns(checkInsData || []);

      const { data: journalData } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setJournalEntries(journalData || []);

      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (streakData) {
        setStreak({ current: streakData.current_streak, best: streakData.best_streak });
      }

      const today = new Date().toISOString().split('T')[0];
      const todayData = checkInsData?.find(c => c.date === today);
      setTodayCheckIn(todayData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCheckIns([]);
    setJournalEntries([]);
    setStreak({ current: 0, best: 0 });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Moon size={48} color="#c41e3a" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: '#a0a0a0' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!accessGranted) return <PasswordGate onSuccess={() => setAccessGranted(true)} />;
if (!user) return <AuthScreen onAuthSuccess={setUser} />;

  const screens = {
    checkin: <CheckInScreen user={user} checkIns={checkIns} todayCheckIn={todayCheckIn} onCheckInComplete={loadUserData} />,
    dashboard: <DashboardScreen checkIns={checkIns} streak={streak} />,
    journal: <JournalScreen user={user} entries={journalEntries} onEntryAdded={loadUserData} />,
    guide: <GuideScreen checkIns={checkIns} />,
    calendar: <CalendarScreen checkIns={checkIns} />
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#e8e8e8', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Moon size={28} color="#c41e3a" />
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>SHADOW SELF AI</h1>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '4px 0 0' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#2a2a2a', color: '#a0a0a0', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <nav style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #2a2a2a', padding: '0 20px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {[
            { id: 'checkin', icon: Moon, label: 'Check-In' },
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'journal', icon: BookOpen, label: 'Journal' },
            { id: 'guide', icon: Brain, label: 'AI Guide' },
            { id: 'calendar', icon: Calendar, label: 'History' }
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setCurrentScreen(id)} style={{ padding: '16px 24px', backgroundColor: currentScreen === id ? '#c41e3a' : 'transparent', color: currentScreen === id ? '#fff' : '#a0a0a0', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: currentScreen === id ? '600' : '400', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s', borderBottom: currentScreen === id ? '2px solid #c41e3a' : '2px solid transparent' }}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {screens[currentScreen]}
      </main>
    </div>
  );
}

function CheckInScreen({ user, checkIns, todayCheckIn, onCheckInComplete }) {
  const [rage, setRage] = useState(todayCheckIn?.rage_level || 5);
  const [control, setControl] = useState(todayCheckIn?.control_level || 5);
  const [authenticity, setAuthenticity] = useState(todayCheckIn?.authenticity_level || 5);
  const [manifestations, setManifestations] = useState(todayCheckIn?.manifestations || []);
  const [integration, setIntegration] = useState(todayCheckIn?.integration_type || '');
  const [aiResponse, setAiResponse] = useState(todayCheckIn?.ai_response || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const manifestationOptions = ['Rage toward ex', 'Obsessive thoughts about her', 'Revenge fantasies', 'Self-destructive urges', 'Social mask/performance', 'Numbness/avoidance', 'Control impulses'];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = {
        analysis: `Your rage is at ${rage}/10 ${rage >= 7 ? '- elevated but manageable' : rage >= 4 ? '- moderate level' : '- under control'}. ${control >= 7 ? 'Strong impulse control maintained.' : 'Working on impulse control.'}`,
        meditation: rage >= 7 ? 'Instant Calm Reset' : rage >= 4 ? 'Impulse Interrupt' : 'Night Spiral Stop',
        journalPrompt: rage >= 7 ? 'What is this rage protecting me from?' : 'What truth am I avoiding today?',
        warning: rage >= 7 && checkIns.filter(c => c.rage_level >= 7).length >= 2 ? 'Pattern alert: Rage elevated for 3+ days' : null
      };

      const today = new Date().toISOString().split('T')[0];
      const { data: existingCheckIn } = await supabase.from('check_ins').select('id').eq('user_id', user.id).eq('date', today).single();

      if (existingCheckIn) {
        await supabase.from('check_ins').update({ rage_level: rage, control_level: control, authenticity_level: authenticity, manifestations, integration_type: integration, ai_response: response, updated_at: new Date().toISOString() }).eq('id', existingCheckIn.id);
      } else {
        await supabase.from('check_ins').insert({ user_id: user.id, date: today, rage_level: rage, control_level: control, authenticity_level: authenticity, manifestations, integration_type: integration, ai_response: response });
      }

      setAiResponse(response);
      if (onCheckInComplete) onCheckInComplete();
    } catch (error) {
      console.error('Error saving check-in:', error);
      alert('Errore nel salvare il check-in. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Daily Shadow Check-In</h2>
      <p style={{ color: '#a0a0a0', marginBottom: '40px' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>1. Rate your shadow intensity today</h3>
        <SliderInput label="Rage" value={rage} onChange={setRage} color="#c41e3a" />
        <SliderInput label="Impulse Control" value={control} onChange={setControl} color="#4a90e2" />
        <SliderInput label="Authenticity" value={authenticity} onChange={setAuthenticity} color="#4caf50" />
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>2. Which shadow aspects emerged today?</h3>
        {manifestationOptions.map(option => (
          <label key={option} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer', padding: '12px', borderRadius: '6px', backgroundColor: manifestations.includes(option) ? '#2a2a2a' : 'transparent', transition: 'background-color 0.2s' }}>
            <input type="checkbox" checked={manifestations.includes(option)} onChange={(e) => { if (e.target.checked) setManifestations([...manifestations, option]); else setManifestations(manifestations.filter(m => m !== option)); }} style={{ marginRight: '12px', width: '18px', height: '18px' }} />
            <span style={{ fontSize: '16px' }}>{option}</span>
          </label>
        ))}
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>3. Did you integrate or repress your shadow today?</h3>
        {['Observed without acting (integration)', 'Followed the impulse (acted out)', 'Suppressed/denied it (repression)', 'Mixed response'].map(option => (
          <label key={option} style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', cursor: 'pointer', padding: '12px', borderRadius: '6px', backgroundColor: integration === option ? '#2a2a2a' : 'transparent' }}>
            <input type="radio" name="integration" checked={integration === option} onChange={() => setIntegration(option)} style={{ marginRight: '12px', width: '18px', height: '18px' }} />
            <span style={{ fontSize: '16px' }}>{option}</span>
          </label>
        ))}
      </div>

      <button onClick={handleSubmit} disabled={!integration || isSubmitting} style={{ width: '100%', padding: '18px', backgroundColor: integration ? '#c41e3a' : '#2a2a2a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: integration ? 'pointer' : 'not-allowed', transition: 'all 0.2s', opacity: isSubmitting ? 0.6 : 1 }}>
        {isSubmitting ? 'SAVING...' : 'SUBMIT CHECK-IN'}
      </button>

      {aiResponse && (
        <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '2px solid #c41e3a', marginTop: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Brain size={24} color="#c41e3a" /> AI Shadow Guide</h3>
          <div style={{ marginBottom: '20px' }}><h4 style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>🌑 SHADOW ANALYSIS</h4><p style={{ fontSize: '16px', lineHeight: '1.6' }}>{aiResponse.analysis}</p></div>
          <div style={{ marginBottom: '20px' }}><h4 style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>💡 RECOMMENDED ACTION</h4><p style={{ fontSize: '16px', lineHeight: '1.6' }}>→ Meditation: "{aiResponse.meditation}" (4 min) <br/>→ Journal prompt: "{aiResponse.journalPrompt}"</p></div>
          {aiResponse.warning && <div style={{ backgroundColor: '#2a1a1a', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #ffa726' }}><h4 style={{ fontSize: '14px', color: '#ffa726', marginBottom: '8px' }}>⚠️ WARNING PATTERN</h4><p style={{ fontSize: '16px' }}>{aiResponse.warning}</p></div>}
          {integration.includes('Observed without acting') && <div style={{ backgroundColor: '#1a2a1a', padding: '16px', borderRadius: '6px', borderLeft: '4px solid #4caf50', marginTop: '16px' }}><h4 style={{ fontSize: '14px', color: '#4caf50', marginBottom: '8px' }}>✓ INTEGRATION NOTE</h4><p style={{ fontSize: '16px' }}>You observed without acting - this IS the work.</p></div>}
        </div>
      )}
    </div>
  );
}

function SliderInput({ label, value, onChange, color }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <label style={{ fontSize: '16px', fontWeight: '500' }}>{label}</label>
        <span style={{ fontSize: '18px', fontWeight: '700', color }}>{value}/10</span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(parseInt(e.target.value))} style={{ width: '100%', height: '8px', borderRadius: '4px', background: `linear-gradient(to right, ${color} 0%, ${color} ${value * 10}%, #2a2a2a ${value * 10}%, #2a2a2a 100%)`, outline: 'none', cursor: 'pointer' }} />
    </div>
  );
}

function DashboardScreen({ checkIns, streak }) {
  const last30Days = checkIns.slice(0, 30).reverse();
  const today = checkIns[0];
  const stats = {
    observed: checkIns.filter(c => c.integration_type?.includes('Observed without acting')).length,
    acted: checkIns.filter(c => c.integration_type?.includes('Followed the impulse')).length,
    repressed: checkIns.filter(c => c.integration_type?.includes('Suppressed')).length
  };
  const integrationRate = checkIns.length > 0 ? Math.round((stats.observed / checkIns.length) * 100) : 0;

  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Shadow Dashboard</h2>
      {today && (
        <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>SHADOW STATE - TODAY</h3>
          <ProgressBar label="Rage" value={today.rage_level} max={10} color="#c41e3a" />
          <ProgressBar label="Control" value={today.control_level} max={10} color="#4a90e2" />
          <ProgressBar label="Authenticity" value={today.authenticity_level} max={10} color="#4caf50" />
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '6px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>🌑 Shadow: {today.rage_level >= 7 ? 'Activated but Contained' : today.rage_level >= 4 ? 'Present and Acknowledged' : 'Integrated'}</p>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>30-DAY TREND</h3>
        <SimpleLineChart data={last30Days} />
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>INTEGRATION STATS ({checkIns.length} days tracked)</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          <StatRow label="✓ Days observed without acting" value={stats.observed} color="#4caf50" />
          <StatRow label="✗ Days acted on impulse" value={stats.acted} color="#c41e3a" />
          <StatRow label="⊘ Days repressed" value={stats.repressed} color="#ffa726" />
        </div>
        <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '6px' }}>
          <p style={{ fontSize: '18px', fontWeight: '600' }}>Integration Rate: <span style={{ color: integrationRate >= 70 ? '#4caf50' : '#ffa726' }}>{integrationRate}%</span></p>
          <p style={{ fontSize: '14px', color: '#a0a0a0', marginTop: '4px' }}>(Goal: &gt;70%)</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>STREAK TRACKER</h3>
        <p style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>🔥 Current Streak: {streak.current} days</p>
        <p style={{ fontSize: '16px', color: '#a0a0a0' }}>Best Streak: {streak.best} days</p>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, max, color }) {
  const percentage = (value / max) * 100;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '16px' }}>{label}</span>
        <span style={{ fontSize: '16px', fontWeight: '600', color }}>{value}/{max}</span>
      </div>
      <div style={{ width: '100%', height: '12px', backgroundColor: '#2a2a2a', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #2a2a2a' }}>
      <span style={{ fontSize: '16px' }}>{label}</span>
      <span style={{ fontSize: '18px', fontWeight: '600', color }}>{value}</span>
    </div>
  );
}

function SimpleLineChart({ data }) {
  if (data.length === 0) return <p style={{ color: '#a0a0a0', textAlign: 'center', padding: '40px' }}>No data yet. Complete your first check-in!</p>;
  const maxValue = 10, chartHeight = 200, chartWidth = 600, pointSpacing = data.length > 1 ? chartWidth / (data.length - 1) : 0;
  const createPath = (values, color) => values.map((val, i) => `${i === 0 ? 'M' : 'L'} ${i * pointSpacing} ${chartHeight - (val / maxValue) * chartHeight}`).join(' ');
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={Math.max(chartWidth, 600)} height={chartHeight} style={{ display: 'block' }}>
        {[0, 2, 4, 6, 8, 10].map(val => <line key={val} x1="0" y1={chartHeight - (val / maxValue) * chartHeight} x2={chartWidth} y2={chartHeight - (val / maxValue) * chartHeight} stroke="#2a2a2a" strokeWidth="1" />)}
        <path d={createPath(data.map(d => d.rage_level), '#c41e3a')} stroke="#c41e3a" strokeWidth="2" fill="none" />
        <path d={createPath(data.map(d => d.control_level), '#4a90e2')} stroke="#4a90e2" strokeWidth="2" fill="none" />
        <path d={createPath(data.map(d => d.authenticity_level), '#4caf50')} stroke="#4caf50" strokeWidth="2" fill="none" />
        {data.map((point, i) => {
          const x = i * pointSpacing;
          return (
            <g key={i}>
              <circle cx={x} cy={chartHeight - (point.rage_level / maxValue) * chartHeight} r="4" fill="#c41e3a" />
              <circle cx={x} cy={chartHeight - (point.control_level / maxValue) * chartHeight} r="4" fill="#4a90e2" />
              <circle cx={x} cy={chartHeight - (point.authenticity_level / maxValue) * chartHeight} r="4" fill="#4caf50" />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#c41e3a', borderRadius: '2px' }} /><span style={{ fontSize: '14px' }}>Rage</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#4a90e2', borderRadius: '2px' }} /><span style={{ fontSize: '14px' }}>Control</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', backgroundColor: '#4caf50', borderRadius: '2px' }} /><span style={{ fontSize: '14px' }}>Authenticity</span></div>
      </div>
    </div>
  );
}

function JournalScreen({ user, entries, onEntryAdded }) {
  const [journalText, setJournalText] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!journalText.trim()) return;
    setIsAnalyzing(true);
    try {
      const analysis = {
        theme: journalText.toLowerCase().includes('she') || journalText.toLowerCase().includes('ex') ? 'Unprocessed grief masked as anger detected' : 'Self-reflection on shadow aspects',
        aspect: 'Your writing reveals rage as a protective mechanism',
        prompt: 'What would happen if you let yourself feel sad instead of angry for 10 minutes?',
        action: 'Meditation: "Detachment" or write: "The sadness underneath my rage is..."'
      };

      await supabase.from('journal_entries').insert({ user_id: user.id, entry_text: journalText, ai_analysis: analysis });
      setAiAnalysis(analysis);
      setJournalText('');
      if (onEntryAdded) onEntryAdded();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      alert('Errore nel salvare il journal entry. Riprova.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Shadow Journal</h2>
      <p style={{ color: '#a0a0a0', marginBottom: '32px' }}>Write the unfiltered truth</p>
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#a0a0a0', marginBottom: '16px' }}>What can't you say out loud?</h3>
        <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="Today I felt...&#10;The rage comes from...&#10;What I really want is..." style={{ width: '100%', minHeight: '200px', backgroundColor: '#0f0f0f', color: '#e8e8e8', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px', fontSize: '16px', fontFamily: 'inherit', resize: 'vertical', lineHeight: '1.6' }} />
        <button onClick={handleAnalyze} disabled={!journalText.trim() || isAnalyzing} style={{ marginTop: '16px', padding: '14px 28px', backgroundColor: journalText.trim() ? '#c41e3a' : '#2a2a2a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: journalText.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={18} /> {isAnalyzing ? 'ANALYZING...' : 'ANALYZE WITH AI'}
        </button>
      </div>
      {aiAnalysis && (
        <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '2px solid #c41e3a', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>🌑 Shadow Analysis</h3>
          <div style={{ marginBottom: '20px' }}><h4 style={{ fontSize: '14px', color: '#ffa726', marginBottom: '8px' }}>RECURRING THEME DETECTED</h4><p style={{ fontSize: '16px', lineHeight: '1.6' }}>{aiAnalysis.theme}</p></div>
          <div style={{ marginBottom: '20px' }}><h4 style={{ fontSize: '14px', color: '#c41e3a', marginBottom: '8px' }}>SHADOW ASPECT IDENTIFIED</h4><p style={{ fontSize: '16px', lineHeight: '1.6' }}>{aiAnalysis.aspect}</p></div>
          <div style={{ marginBottom: '20px' }}><h4 style={{ fontSize: '14px', color: '#4a90e2', marginBottom: '8px' }}>INTEGRATION PROMPT</h4><p style={{ fontSize: '16px', lineHeight: '1.6', fontStyle: 'italic' }}>"{aiAnalysis.prompt}"</p></div>
          <div><h4 style={{ fontSize: '14px', color: '#4caf50', marginBottom: '8px' }}>RECOMMENDED ACTION</h4><p style={{ fontSize: '16px', lineHeight: '1.6' }}>→ {aiAnalysis.action}</p></div>
        </div>
      )}
      {entries.length > 0 && (
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Previous Entries</h3>
          {entries.map((entry, i) => (
            <div key={i} style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a2a', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '12px' }}>{new Date(entry.created_at).toLocaleDateString()}</p>
              <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{entry.entry_text.length > 200 ? entry.entry_text.substring(0, 200) + '...' : entry.entry_text}</p>
              {entry.ai_analysis && <p style={{ fontSize: '14px', color: '#4a90e2', fontStyle: 'italic' }}>Theme: {entry.ai_analysis.theme}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideScreen({ checkIns }) {
  const today = checkIns[0];
  if (!today) return (<div style={{ textAlign: 'center', padding: '60px 20px' }}><Brain size={48} color="#c41e3a" style={{ margin: '0 auto 20px' }} /><h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Complete Your First Check-In</h2><p style={{ color: '#a0a0a0' }}>The AI Guide needs your data to provide personalized recommendations</p></div>);
  const meditation = today.rage_level >= 7 ? 'Instant Calm Reset' : today.rage_level >= 4 ? 'Impulse Interrupt' : 'Night Spiral Stop';
  const duration = '4 min';
  const prompt = today.ai_response?.journalPrompt || 'What is my shadow trying to tell me?';
  const physical = today.rage_level >= 7 ? '50 push-ups or 5-min cold shower' : '20 push-ups or brisk walk';
  const recentHighRage = checkIns.slice(0, 3).filter(c => c.rage_level >= 6).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>AI Shadow Guide</h2>
      <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>TODAY'S SHADOW WORK</h3>
        <p style={{ fontSize: '16px', color: '#a0a0a0', marginBottom: '24px' }}>Based on your state (Rage: {today.rage_level}/10), here's what will help most:</p>
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '6px', marginBottom: '16px' }}><h4 style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>🎧 MEDITATION</h4><p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>"{meditation}" ({duration})</p><button style={{ padding: '10px 20px', backgroundColor: '#c41e3a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>PLAY NOW</button></div>
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '6px', marginBottom: '16px' }}><h4 style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>✍️ JOURNAL PROMPT</h4><p style={{ fontSize: '16px', fontStyle: 'italic', marginBottom: '12px' }}>"{prompt}"</p><button style={{ padding: '10px 20px', backgroundColor: '#4a90e2', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>OPEN JOURNAL</button></div>
        <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '6px', marginBottom: '16px' }}><h4 style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>💪 PHYSICAL RELEASE</h4><p style={{ fontSize: '16px' }}>→ {physical}</p></div>
        {recentHighRage >= 2 && <div style={{ backgroundColor: '#2a1a1a', padding: '20px', borderRadius: '6px', borderLeft: '4px solid #ffa726' }}><h4 style={{ fontSize: '14px', color: '#ffa726', marginBottom: '8px' }}>⚠️ PATTERN ALERT</h4><p style={{ fontSize: '16px', marginBottom: '8px' }}>Rage has been elevated for {recentHighRage} consecutive days.</p><p style={{ fontSize: '16px', fontStyle: 'italic' }}>Consider: What are you avoiding?</p></div>}
      </div>
    </div>
  );
}

function CalendarScreen({ checkIns }) {
  return (
    <div>
      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>History Calendar</h2>
      {checkIns.length === 0 ? (
        <div style={{ backgroundColor: '#1a1a1a', padding: '60px 20px', borderRadius: '8px', textAlign: 'center' }}><Calendar size={48} color="#a0a0a0" style={{ margin: '0 auto 20px' }} /><p style={{ color: '#a0a0a0' }}>No check-ins yet. Start your shadow work journey today.</p></div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {checkIns.map((checkIn, i) => {
            const date = new Date(checkIn.date);
            const status = checkIn.integration_type?.includes('Observed without acting') ? 'integration' : checkIn.integration_type?.includes('Followed the impulse') ? 'acted' : checkIn.integration_type?.includes('Suppressed') ? 'repressed' : 'mixed';
            const statusColor = status === 'integration' ? '#4caf50' : status === 'acted' ? '#c41e3a' : status === 'repressed' ? '#ffa726' : '#a0a0a0';
            const statusIcon = status === 'integration' ? '✓' : status === 'acted' ? '✗' : status === 'repressed' ? '⊘' : '~';
            return (
              <div key={i} style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #2a2a2a', borderLeft: `4px solid ${statusColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p style={{ fontSize: '14px', color: statusColor }}>{statusIcon} {checkIn.integration_type}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px', color: '#a0a0a0', display: 'block' }}>Rage</span><span style={{ fontSize: '20px', fontWeight: '700', color: '#c41e3a' }}>{checkIn.rage_level}</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div><span style={{ fontSize: '12px', color: '#a0a0a0', display: 'block' }}>Rage</span><span style={{ fontSize: '16px', fontWeight: '600', color: '#c41e3a' }}>{checkIn.rage_level}/10</span></div>
                  <div><span style={{ fontSize: '12px', color: '#a0a0a0', display: 'block' }}>Control</span><span style={{ fontSize: '16px', fontWeight: '600', color: '#4a90e2' }}>{checkIn.control_level}/10</span></div>
                  <div><span style={{ fontSize: '12px', color: '#a0a0a0', display: 'block' }}>Authenticity</span><span style={{ fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>{checkIn.authenticity_level}/10</span></div>
                </div>
                {checkIn.manifestations && checkIn.manifestations.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #2a2a2a' }}>
                    <p style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>Shadow aspects:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {checkIn.manifestations.map((m, idx) => <span key={idx} style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: '#2a2a2a', borderRadius: '4px', color: '#a0a0a0' }}>{m}</span>)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function PasswordGate({ onSuccess }) {
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState(false);
  const ACCESS_CODE = 'ALPHA2026';

  const handleSubmit = () => {
    if (input.trim().toUpperCase() === ACCESS_CODE) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f0f0f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '48px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <Moon size={40} color="#c41e3a" style={{ margin: '0 auto 20px' }} />
        <h1 style={{ color: '#e8e8e8', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
          Shadow Self AI
        </h1>
        <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '32px' }}>
          Enter your access code to continue
        </p>
        <input
          type="text"
          placeholder="Access code"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: '#0f0f0f',
            border: error ? '1px solid #c41e3a' : '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#e8e8e8',
            fontSize: '16px',
            marginBottom: '12px',
            boxSizing: 'border-box',
            textAlign: 'center',
            letterSpacing: '0.1em'
          }}
        />
        {error && (
          <p style={{ color: '#c41e3a', fontSize: '13px', marginBottom: '12px' }}>
            Invalid access code. Check your email.
          </p>
        )}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#c41e3a',
            color: '#fff',
            fontWeight: '700',
            fontSize: '15px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            letterSpacing: '0.05em'
          }}
        >
          ACCESS NOW →
        </button>
      </div>
    </div>
  );
}
