import { useState, useEffect } from 'react'
import { db, storage } from '../services/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { useAuth } from '../context/AuthContext'

function Resources() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [newResource, setNewResource] = useState({ title: '', description: '' })
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [user])

  const fetchResources = async () => {
    try {
      const resourcesQuery = query(
        collection(db, 'resources'),
        where('userId', '==', user.uid)
      )
      const querySnapshot = await getDocs(resourcesQuery)
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setResources(resourcesData)
    } catch (error) {
      console.error('Error fetching resources:', error)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload file to Firebase Storage
      const storageRef = ref(storage, `resources/${user.uid}/${selectedFile.name}`)
      await uploadBytes(storageRef, selectedFile)
      const downloadURL = await getDownloadURL(storageRef)

      // Save resource metadata to Firestore
      const resourceData = {
        ...newResource,
        userId: user.uid,
        fileName: selectedFile.name,
        fileUrl: downloadURL,
        fileType: selectedFile.type,
        uploadedAt: new Date().toISOString()
      }
      await addDoc(collection(db, 'resources'), resourceData)

      // Reset form
      setNewResource({ title: '', description: '' })
      setSelectedFile(null)
      fetchResources()
    } catch (error) {
      console.error('Error uploading resource:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteResource = async (resource) => {
    try {
      // Delete file from Storage
      const storageRef = ref(storage, `resources/${user.uid}/${resource.fileName}`)
      await deleteObject(storageRef)

      // Delete metadata from Firestore
      await deleteDoc(doc(db, 'resources', resource.id))

      fetchResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Study Resources</h1>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <input
            type="text"
            placeholder="Resource title"
            value={newResource.title}
            onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Description"
            value={newResource.description}
            onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:bg-gray-400"
        >
          {uploading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>

      {/* Resources List */}
      <div className="space-y-4">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{resource.title}</h3>
                <p className="text-gray-600">{resource.description}</p>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Download {resource.fileName}
                </a>
              </div>
              <button
                onClick={() => handleDeleteResource(resource)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Resources
