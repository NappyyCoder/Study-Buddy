import { useState, useEffect } from 'react'
import { db } from '../services/firebase'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  doc 
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' })
  const [isEditing, setIsEditing] = useState(null)
  const [editTask, setEditTask] = useState({})

  useEffect(() => {
    fetchTasks()
  }, [user])

  const fetchTasks = async () => {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(tasksQuery)
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTasks(tasksData)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    try {
      const taskData = {
        ...newTask,
        userId: user.uid,
        completed: false,
        createdAt: new Date().toISOString()
      }
      await addDoc(collection(db, 'tasks'), taskData)
      setNewTask({ title: '', description: '', dueDate: '' })
      fetchTasks()
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleUpdateTask = async (e) => {
    e.preventDefault()
    try {
      const taskRef = doc(db, 'tasks', isEditing)
      await updateDoc(taskRef, editTask)
      setIsEditing(null)
      setEditTask({})
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const toggleComplete = async (task) => {
    try {
      const taskRef = doc(db, 'tasks', task.id)
      await updateDoc(taskRef, {
        completed: !task.completed
      })
      fetchTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Add Task
        </button>
      </form>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow">
            {isEditing === task.id ? (
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <input
                  type="text"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="date"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                    className="h-4 w-4 text-primary-600 rounded"
                  />
                  <div>
                    <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <p className="text-sm text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(task.id)
                      setEditTask(task)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Tasks