import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Course, CalendarEvent, SharedCalendar, Subscription } from '../types/database'

// Shared prefetch cache — useAuth populates this before setting user
export const prefetchedData: {
  courses: Course[] | null
  events: CalendarEvent[] | null
  subscriptions: Subscription[] | null
} = {
  courses: null,
  events: null,
  subscriptions: null
}

function generateToken(): string {
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 32)
}

export function useCalendarData(userId?: string) {
  // Use prefetched data for initial state if available (instant render)
  const [courses, setCourses] = useState<Course[]>(() => {
    if (prefetchedData.courses) {
      const data = prefetchedData.courses
      prefetchedData.courses = null
      return data
    }
    return []
  })
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (prefetchedData.events) {
      const data = prefetchedData.events
      prefetchedData.events = null
      return data
    }
    return []
  })
  const [loading, setLoading] = useState(courses.length === 0)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)

      if (!userId) {
        setCourses([])
        setEvents([])
        setLoading(false)
        return
      }

      // Check if prefetched data is waiting (from signInWithEmail)
      if (prefetchedData.courses && prefetchedData.events) {
        setCourses(prefetchedData.courses)
        setEvents(prefetchedData.events)
        prefetchedData.courses = null
        prefetchedData.events = null
        prefetchedData.subscriptions = null
        setLoading(false)
        return
      }

      const [coursesRes, eventsRes, subsRes] = await Promise.all([
        supabase.from('courses').select('*').order('sort_order'),
        supabase.from('events').select('*').order('date'),
        supabase.from('subscriptions').select('*').eq('subscriber_id', userId)
      ])

      if (coursesRes.error) throw coursesRes.error
      if (eventsRes.error) throw eventsRes.error

      const subscriptions: Subscription[] = subsRes.error ? [] : (subsRes.data || [])
      const subMap = new Map(subscriptions.map(s => [s.source_course_id, s]))

      // Mark owned vs subscribed courses
      const mergedCourses: Course[] = (coursesRes.data || []).map(c => {
        const sub = subMap.get(c.id)
        if (sub) {
          return {
            ...c,
            isSubscribed: true,
            subscriptionId: sub.id,
            active: sub.active,
            sort_order: sub.sort_order
          }
        }
        return { ...c, isSubscribed: false, subscriptionId: null }
      })

      setCourses(mergedCourses)
      setEvents(eventsRes.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Course mutations
  const addCourse = async (course: Omit<Course, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('courses')
      .insert({ ...course, user_id: userId })
      .select()
      .single()

    if (error) throw error
    const newCourse = { ...data, isSubscribed: false, subscriptionId: null }
    setCourses(prev => [...prev, newCourse])
    return newCourse
  }

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    const course = courses.find(c => c.id === id)

    // For subscribed courses, only allow active/sort_order updates via subscriptions table
    if (course?.isSubscribed && course.subscriptionId) {
      const subUpdates: Record<string, unknown> = {}
      if ('active' in updates) subUpdates.active = updates.active
      if ('sort_order' in updates) subUpdates.sort_order = updates.sort_order

      if (Object.keys(subUpdates).length === 0) {
        throw new Error('Cannot edit a subscribed course')
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(subUpdates)
        .eq('id', course.subscriptionId)

      if (error) throw error
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...subUpdates } : c))
      return { ...course, ...subUpdates }
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setCourses(prev => prev.map(c => c.id === id ? { ...data, isSubscribed: false, subscriptionId: null } : c))
    return data
  }

  const deleteCourse = async (id: string) => {
    const course = courses.find(c => c.id === id)

    // For subscribed courses, delete the subscription (unsubscribe)
    if (course?.isSubscribed && course.subscriptionId) {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', course.subscriptionId)

      if (error) throw error
      setCourses(prev => prev.filter(c => c.id !== id))
      return
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)

    if (error) throw error
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  const reorderCourses = async (reorderedCourses: Course[]) => {
    // Optimistically update local state
    setCourses(reorderedCourses)

    // Update sort_order in database — subscribed courses go to subscriptions table
    const updates = reorderedCourses.map((course, index) => {
      if (course.isSubscribed && course.subscriptionId) {
        return supabase
          .from('subscriptions')
          .update({ sort_order: index })
          .eq('id', course.subscriptionId)
      }
      return supabase
        .from('courses')
        .update({ sort_order: index })
        .eq('id', course.id)
    })

    const results = await Promise.all(updates)
    const hasError = results.some(r => r.error)
    if (hasError) {
      // Revert on error
      await fetchData()
      throw new Error('Failed to reorder courses')
    }
  }

  // Event mutations
  const addEvent = async (event: Omit<CalendarEvent, 'id' | 'created_at'>) => {
    // Block adding events to subscribed courses
    if (event.course_id) {
      const course = courses.find(c => c.id === event.course_id)
      if (course?.isSubscribed) {
        throw new Error('Cannot add events to a subscribed course')
      }
    }

    const { data, error } = await supabase
      .from('events')
      .insert({ ...event, user_id: userId })
      .select()
      .single()

    if (error) throw error
    setEvents(prev => [...prev, data].sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      if (a.start_time && !b.start_time) return -1
      if (!a.start_time && b.start_time) return 1
      if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time)
      return 0
    }))
    return data
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    // Block editing events from subscribed courses
    const event = events.find(e => e.id === id)
    if (event?.course_id) {
      const course = courses.find(c => c.id === event.course_id)
      if (course?.isSubscribed) {
        throw new Error('Cannot edit events from a subscribed course')
      }
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setEvents(prev => prev.map(e => e.id === id ? data : e).sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      if (a.start_time && !b.start_time) return -1
      if (!a.start_time && b.start_time) return 1
      if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time)
      return 0
    }))
    return data
  }

  const deleteEvent = async (id: string) => {
    // Block deleting events from subscribed courses
    const event = events.find(e => e.id === id)
    if (event?.course_id) {
      const course = courses.find(c => c.id === event.course_id)
      if (course?.isSubscribed) {
        throw new Error('Cannot delete events from a subscribed course')
      }
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  // Sharing functions
  const getShareForCourse = async (courseId: string): Promise<SharedCalendar | null> => {
    const { data, error } = await supabase
      .from('shared_calendars')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()

    if (error || !data) return null
    return data
  }

  const createShare = async (courseId: string): Promise<SharedCalendar> => {
    const token = generateToken()
    const { data, error } = await supabase
      .from('shared_calendars')
      .insert({ user_id: userId, course_id: courseId, share_token: token })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Copy mode: one-time copy with full edit rights (existing behavior)
  const subscribeToShareCopy = async (token: string): Promise<Course> => {
    // Use server-side RPC to copy the shared course (bypasses RLS for cross-user read)
    const { data, error: rpcError } = await supabase.rpc('subscribe_to_share', {
      p_token: token
    })

    if (rpcError) throw new Error(rpcError.message)
    if (!data) throw new Error('Failed to subscribe')

    const newCourse = { ...(data as Course), isSubscribed: false, subscriptionId: null }
    setCourses(prev => [...prev, newCourse])

    // Refetch events to pick up the newly copied events
    const { data: allEvents } = await supabase
      .from('events')
      .select('*')
      .order('date')

    if (allEvents) {
      setEvents(allEvents)
    }

    return newCourse
  }

  // Live sync mode: subscribe to see sharer's data read-only
  const subscribeToShareLive = async (token: string): Promise<Course> => {
    // Look up the shared calendar by token
    const { data: sharedCal, error: lookupError } = await supabase
      .from('shared_calendars')
      .select('*')
      .eq('share_token', token)
      .eq('is_active', true)
      .single()

    if (lookupError || !sharedCal) {
      throw new Error('Invalid or inactive share link')
    }

    // Calculate sort_order for the new subscription
    const maxOrder = courses.reduce((max, c) => Math.max(max, c.sort_order), -1)

    // Insert subscription
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        subscriber_id: userId,
        shared_calendar_id: sharedCal.id,
        source_course_id: sharedCal.course_id,
        source_user_id: sharedCal.user_id,
        sort_order: maxOrder + 1
      })
      .select()
      .single()

    if (subError) {
      if (subError.code === '23505') {
        throw new Error('You are already subscribed to this course')
      }
      throw new Error(subError.message)
    }

    // Refetch to get the course data (now accessible via RLS)
    await fetchData()

    // Return the subscribed course
    const subscribedCourse = courses.find(c => c.id === sharedCal.course_id)
    if (subscribedCourse) return subscribedCourse

    // If not found in current state yet, return a placeholder that fetchData will fix
    return {
      id: sharedCal.course_id,
      name: 'Subscribed course',
      color: '#666',
      active: true,
      sort_order: maxOrder + 1,
      created_at: new Date().toISOString(),
      isSubscribed: true,
      subscriptionId: sub.id
    }
  }

  const toggleShare = async (shareId: string, isActive: boolean): Promise<SharedCalendar> => {
    const { data, error } = await supabase
      .from('shared_calendars')
      .update({ is_active: isActive })
      .eq('id', shareId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Helper: check if an event belongs to a subscribed course
  const isEventSubscribed = (event: CalendarEvent): boolean => {
    if (!event.course_id) return false
    const course = courses.find(c => c.id === event.course_id)
    return course?.isSubscribed === true
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
    reorderCourses,
    addEvent,
    updateEvent,
    deleteEvent,
    getShareForCourse,
    createShare,
    toggleShare,
    subscribeToShareCopy,
    subscribeToShareLive,
    isEventSubscribed
  }
}
