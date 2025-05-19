'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProgressLog {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  project: {
    title: string;
  };
}

interface SupabaseLog {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  project: {
    title: string;
  };
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchLogs = async () => {
      try {
        // First get all projects owned by the user
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id);

        if (projectsError) throw projectsError;

        if (!projects || projects.length === 0) {
          setLogs([]);
          setLoading(false);
          return;
        }

        // Then get all logs for those projects
        const { data: logsData, error: logsError } = await supabase
          .from('progress_logs')
          .select(`
            id,
            project_id,
            content,
            created_at,
            project:projects (
              title
            )
          `)
          .in('project_id', projects.map(p => p.id))
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;
        
        // Cast the data to our expected type
        const typedLogs = ((logsData || []) as unknown as SupabaseLog[]).map(log => ({
          id: log.id,
          project_id: log.project_id,
          content: log.content,
          created_at: log.created_at,
          project: {
            title: log.project?.title || 'Untitled Project'
          }
        }));
        
        setLogs(typedLogs);
      } catch (err: any) {
        console.error('Error fetching logs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, router, authLoading]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getLogsForDate = (date: Date) => {
    return logs.filter(log => {
      const logDate = new Date(log.created_at);
      return (
        logDate.getDate() === date.getDate() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayLogs = getLogsForDate(date);
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-indigo-50' : ''
          }`}
        >
          <div className="font-medium">{day}</div>
          {dayLogs.length > 0 && (
            <div className="text-xs text-indigo-600 mt-1">
              {dayLogs.length} log{dayLogs.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>

        {selectedDate && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Logs for {selectedDate.toLocaleDateString()}
            </h3>
            {getLogsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500">No logs for this date.</p>
            ) : (
              <div className="space-y-4">
                {getLogsForDate(selectedDate).map((log) => (
                  <div key={log.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900">{log.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Project: {log.project.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 