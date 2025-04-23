import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile