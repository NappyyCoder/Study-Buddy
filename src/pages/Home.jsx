import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { collection, query, where, getDocs, limit } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user } = useAuth()
  const [recentTasks, setRecentTasks] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [studyGroups, setStudyGroups] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch recent tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          limit(5)
        )
        const tasksDocs = await getDocs(tasksQuery)
        setRecentTasks(tasksDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })))

        // Fetch upcoming deadlines
        const today = new Date()
        const deadlinesQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('dueDate', '>=', today),
          limit(3)
        )
        const deadlinesDocs = await getDocs(deadlinesQuery)
        setUpcomingDeadlines(deadlinesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })))

        // Fetch study groups
        const groupsQuery = query(
          collection(db, 'groups'),
          where('members', 'array-contains', user.uid),
          limit(3)
        )
        const groupsDocs = await getDocs(groupsQuery)
        setStudyGroups(groupsDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [user])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Recent Tasks */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  className="h-4 w-4 text-primary-600 rounded"
                  readOnly
                />
                <span className="ml-3 text-sm text-gray-700">{task.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {upcomingDeadlines.map(task => (
              <div key={task.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{task.title}</span>
                <span className="text-sm text-gray-500">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Study Groups */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">My Study Groups</h2>
          <div className="space-y-3">
            {studyGroups.map(group => (
              <div key={group.id} className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {group.name.charAt(0)}
                  </span>
                </div>
                <span className="ml-3 text-sm text-gray-700">{group.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home