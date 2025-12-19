import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function AdminUsers({ token, onLogout }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else if (response.status === 401) {
        onLogout()
      } else if (response.status === 403) {
        setError('Admin access required')
      } else {
        setError('Failed to fetch users')
      }
    } catch (err) {
      setError('Failed to fetch users')
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setEmail(user.email)
    setIsAdmin(user.is_admin)
    setPassword('')
    setPasswordConfirmation('')
    setError('')
    setSuccess('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password && password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    try {
      const updateData = { email, is_admin: isAdmin }
      if (password) {
        updateData.password = password
        updateData.password_confirmation = passwordConfirmation
      }

      const response = await fetch(`${API_URL}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user: updateData }),
      })

      if (response.ok) {
        setSuccess('User updated successfully')
        setEditingUser(null)
        setEmail('')
        setPassword('')
        setPasswordConfirmation('')
        setIsAdmin(false)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.errors ? data.errors.join(', ') : 'Update failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess('User deleted successfully')
        fetchUsers()
      } else {
        setError('Failed to delete user')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setEmail('')
    setPassword('')
    setPasswordConfirmation('')
    setIsAdmin(false)
    setError('')
    setSuccess('')
  }

  return (
    <div>
      <div className="navbar">
        <h1>Manage All Users (Admin)</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#2196F3' }}>
            Back to Dashboard
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>
      
      <div className="container">
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {editingUser && (
          <div className="form-container">
            <h2>Edit User: {editingUser.email}</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isAdmin}
                    onChange={(e) => setIsAdmin(e.target.checked)}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Admin User
                </label>
              </div>

              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="6"
                />
              </div>

              {password && (
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    minLength="6"
                  />
                </div>
              )}

              <div className="button-group">
                <button type="submit" className="btn">
                  Update User
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="items-container">
          <h2>All Users</h2>
          {users.length === 0 ? (
            <p className="no-items">No users found.</p>
          ) : (
            <div className="items-grid">
              {users.map((user) => (
                <div key={user.id} className="item-card">
                  <h3>{user.email}</h3>
                  <p>
                    <strong>Status:</strong> {user.is_admin ? '👑 Admin' : '👤 Regular User'}
                  </p>
                  <p>
                    <strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(user)} className="btn btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="btn btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers

