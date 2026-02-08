import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Course, CalendarEvent } from '../types/database'

export function useCalendarData() {
  const [courses, setCourses] = useState<Course[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [coursesRes, eventsRes] = await Promise.all([
        supabase.from('courses').select('*').order('name'),
        supabase.from('events').select('*').order('date')
      ])

      if (coursesRes.error) throw coursesRes.error
      if (eventsRes.error) throw eventsRes.error

      setCourses(coursesRes.data || [])
      setEvents(eventsRes.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Course mutations
  const addCourse = async (course: Omit<Course, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single()

    if (error) throw error
    setCourses(prev => [...prev, data])
    return data
  }

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setCourses(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteCourse = async (id: string) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  // Event mutations
  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) throw error
    setEvents(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setEvents(prev => prev.map(e => e.id === id ? data : e).sort((a, b) => a.date.localeCompare(b.date)))
    return data
  }

  const deleteEvent = async (id: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  return {
    courses,
    events,
    loading,
    error,
    refetch: fetchData,
    addCourse,
    updateCourse,
    deleteCourse,
    addEvent,
    updateEvent,
    deleteEvent
  }
}
