import type { Course } from '../types/database'
import './CourseFilter.css'

interface CourseFilterProps {
  courses: Course[]
  activeCourseIds: Set<string>
  onToggle: (courseId: string) => void
  onAddCourse: () => void
  onEditCourse: (course: Course) => void
}

export function CourseFilter({ courses, activeCourseIds, onToggle, onAddCourse, onEditCourse }: CourseFilterProps) {
  return (
    <div className="course-filter">
      <div className="filter-label">Courses:</div>
      <div className="filter-items">
        {courses.map((course) => (
          <label key={course.id} className="filter-item">
            <input
              type="checkbox"
              checked={activeCourseIds.has(course.id)}
              onChange={() => onToggle(course.id)}
            />
            <span
              className="color-dot"
              style={{ backgroundColor: course.color }}
            />
            <span
              className="course-name"
              onClick={(e) => {
                e.preventDefault()
                onEditCourse(course)
              }}
            >
              {course.name}
            </span>
          </label>
        ))}
        <button className="add-course-btn" onClick={onAddCourse}>
          + Add Course
        </button>
      </div>
    </div>
  )
}
