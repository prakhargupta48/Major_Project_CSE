"use client"

import { useState } from "react"

const existingLocations = [
  {
    id: "L001",
    address: "123 Main St, New York, NY 10001",
    demand: "200 kg",
    latitude: "40.7128",
    longitude: "-74.0060",
  },
  {
    id: "L002",
    address: "456 Park Ave, New York, NY 10022",
    demand: "350 kg",
    latitude: "40.7589",
    longitude: "-73.9851",
  },
  {
    id: "L003",
    address: "789 Broadway, New York, NY 10003",
    demand: "150 kg",
    latitude: "40.7309",
    longitude: "-73.9872",
  },
]

const LocationsTab = () => {
  const [formData, setFormData] = useState({
    address: "",
    demand: "",
    latitude: "",
    longitude: "",
  })
  const [locations, setLocations] = useState(existingLocations)
  const [editingId, setEditingId] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (editingId) {
      // Update existing location
      setLocations(
        locations.map((location) =>
          location.id === editingId
            ? {
                ...location,
                address: formData.address,
                demand: `${formData.demand} kg`,
                latitude: formData.latitude,
                longitude: formData.longitude,
              }
            : location,
        ),
      )
      setEditingId(null)
    } else {
      // Add new location
      const newLocation = {
        id: `L${String(locations.length + 1).padStart(3, "0")}`,
        address: formData.address,
        demand: `${formData.demand} kg`,
        latitude: formData.latitude,
        longitude: formData.longitude,
      }
      setLocations([...locations, newLocation])
    }

    // Reset form
    setFormData({
      address: "",
      demand: "",
      latitude: "",
      longitude: "",
    })
  }

  const handleEdit = (location) => {
    setEditingId(location.id)
    setFormData({
      address: location.address,
      demand: location.demand.replace(" kg", ""),
      latitude: location.latitude,
      longitude: location.longitude,
    })
  }

  const handleDelete = (id) => {
    setLocations(locations.filter((location) => location.id !== id))
  }

  return (
    <div className="dashboard-tab">
      <div className="card">
        <div className="card-header">
          <h2>Location Management</h2>
          <p>Add, edit, or remove delivery locations.</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                placeholder="Enter full address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="demand">Demand Capacity (kg)</label>
              <input
                id="demand"
                name="demand"
                type="text"
                placeholder="e.g. 200"
                value={formData.demand}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                id="latitude"
                name="latitude"
                type="text"
                placeholder="e.g. 40.7128"
                value={formData.latitude}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                id="longitude"
                name="longitude"
                type="text"
                placeholder="e.g. -74.0060"
                value={formData.longitude}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Location" : "Add Location"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ address: "", demand: "", latitude: "", longitude: "" })
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="table-container">
            <h3>Your Locations</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>Demand</th>
                  <th>Coordinates</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td>{location.id}</td>
                    <td>{location.address}</td>
                    <td>{location.demand}</td>
                    <td>{`${location.latitude}, ${location.longitude}`}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(location)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(location.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationsTab

