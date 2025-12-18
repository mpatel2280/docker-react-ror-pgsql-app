import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function UserProfile({ token, onLogout }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userId = payload.user_id

      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setEmail(data.email)
      } else if (response.status === 401) {
        onLogout()
      } else {
        setError('Failed to fetch user profile')
      }
    } catch (err) {
      setError('Failed to fetch user profile')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password && password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    if (password && !currentPassword) {
      setError('Current password is required to change password')
      return
    }

    try {
      const updateData = { email }
      if (password) {
        updateData.password = password
        updateData.password_confirmation = passwordConfirmation
        updateData.current_password = currentPassword
      }

      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user: updateData }),
      })

      if (response.ok) {
        setSuccess('Profile updated successfully')
        setPassword('')
        setPasswordConfirmation('')
        setCurrentPassword('')
        setIsEditing(false)
        fetchUserProfile()
      } else {
        const data = await response.json()
        setError(data.errors ? data.errors.join(', ') : 'Update failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert('Account deleted successfully')
        onLogout()
      } else {
        setError('Failed to delete account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleCancel = () => {
    setEmail(user.email)
    setPassword('')
    setPasswordConfirmation('')
    setCurrentPassword('')
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="navbar">
        <h1>User Profile</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#2196F3' }}>
            Back to Dashboard
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>
      
      <div className="container">
        <div className="form-container">
          <h2>Manage Your Account</h2>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {!isEditing ? (
            <div>
              <div className="form-group">
                <label>Email</label>
                <p style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>{user.email}</p>
              </div>
              <div className="form-group">
                <label>Member Since</label>
                <p style={{ padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="button-group">
                <button onClick={() => setIsEditing(true)} className="btn">
                  Edit Profile
                </button>
                <button onClick={handleDelete} className="btn btn-danger" style={{ width: 'auto' }}>
                  Delete Account
                </button>
              </div>
            </div>
          ) : (
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
                <label>New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength="6"
                />
              </div>

              {password && (
                <>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      minLength="6"
                    />
                  </div>

                  <div className="form-group">
                    <label>Current Password (required to change password)</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="button-group">
                <button type="submit" className="btn">
                  Update Profile
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserProfile

