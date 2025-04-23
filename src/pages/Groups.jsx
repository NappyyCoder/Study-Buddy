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
  doc,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

function Groups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [newGroup, setNewGroup] = useState({ name: '', description: '' })
  const [isEditing, setIsEditing] = useState(null)
  const [editGroup, setEditGroup] = useState({})
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    fetchGroups()
  }, [user])

  const fetchGroups = async () => {
    try {
      const groupsQuery = query(
        collection(db, 'groups'),
        where('members', 'array-contains', user.uid)
      )
      const querySnapshot = await getDocs(groupsQuery)
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setGroups(groupsData)
    } catch (error) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleCreateGroup = async (e) => {
    e.preventDefault()
    try {
      const groupData = {
        ...newGroup,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: new Date().toISOString()
      }
      await addDoc(collection(db, 'groups'), groupData)
      setNewGroup({ name: '', description: '' })
      fetchGroups()
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const handleUpdateGroup = async (e) => {
    e.preventDefault()
    try {
      const groupRef = doc(db, 'groups', isEditing)
      await updateDoc(groupRef, editGroup)
      setIsEditing(null)
      setEditGroup({})
      fetchGroups()
    } catch (error) {
      console.error('Error updating group:', error)
    }
  }

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteDoc(doc(db, 'groups', groupId))
      fetchGroups()
    } catch (error) {
      console.error('Error deleting group:', error)
    }
  }

  const handleInviteMember = async (groupId) => {
    try {
      // In a real app, you'd want to look up the user by email first
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', inviteEmail)
      )
      const userSnapshot = await getDocs(usersQuery)
      
      if (!userSnapshot.empty) {
        const newMemberId = userSnapshot.docs[0].id
        const groupRef = doc(db, 'groups', groupId)
        await updateDoc(groupRef, {
          members: arrayUnion(newMemberId)
        })
        setInviteEmail('')
        fetchGroups()
      }
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Study Groups</h1>

      {/* Create Group Form */}
      <form onSubmit={handleCreateGroup} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <input
            type="text"
            placeholder="Group name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Create Group
        </button>
      </form>

      {/* Groups List */}
      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.id} className="bg-white p-6 rounded-lg shadow">
            {isEditing === group.id ? (
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <input
                  type="text"
                  value={editGroup.name}
                  onChange={(e) => setEditGroup({ ...editGroup, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
                <textarea
                  value={editGroup.description}
                  onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })}
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
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{group.name}</h3>
                    <p className="text-gray-500">{group.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setIsEditing(group.id)
                        setEditGroup(group)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Invite Member Form */}
                <div className="mt-4 flex space-x-2">
                  <input
                    type="email"
                    placeholder="Invite member by email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={() => handleInviteMember(group.id)}
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                  >
                    Invite
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

export default Groups