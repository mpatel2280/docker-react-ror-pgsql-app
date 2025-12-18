import { useState, useEffect } from 'react'
import './Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function Dashboard({ token, onLogout }) {
  const [items, setItems] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setItems(data)
      } else if (response.status === 401) {
        onLogout()
      }
    } catch (err) {
      setError('Failed to fetch items')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const url = editingId 
      ? `${API_URL}/api/items/${editingId}`
      : `${API_URL}/api/items`
    
    const method = editingId ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ item: { title, description } }),
      })

      if (response.ok) {
        setSuccess(editingId ? 'Item updated successfully' : 'Item created successfully')
        setTitle('')
        setDescription('')
        setEditingId(null)
        fetchItems()
      } else {
        const data = await response.json()
        setError(data.errors ? data.errors.join(', ') : 'Operation failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleEdit = (item) => {
    setTitle(item.title)
    setDescription(item.description || '')
    setEditingId(item.id)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`${API_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSuccess('Item deleted successfully')
        fetchItems()
      } else {
        setError('Failed to delete item')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  return (
    <div>
      <div className="navbar">
        <h1>My Items</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      
      <div className="container">
        <div className="form-container">
          <h2>{editingId ? 'Edit Item' : 'Create New Item'}</h2>
          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="btn">
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="items-container">
          <h2>Your Items</h2>
          {items.length === 0 ? (
            <p className="no-items">No items yet. Create your first item!</p>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.title}</h3>
                  <p>{item.description || 'No description'}</p>
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)} className="btn btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn btn-danger">
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

export default Dashboard

