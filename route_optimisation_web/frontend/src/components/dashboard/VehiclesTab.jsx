"use client"

import { useState } from "react"

const vehicleTypes = ["Van", "Small Truck", "Medium Truck", "Large Truck", "Semi-Trailer"]

const existingVehicles = [
  {
    id: "V001",
    type: "Van",
    capacity: "800 kg",
    count: 3,
  },
  {
    id: "V002",
    type: "Small Truck",
    capacity: "2000 kg",
    count: 2,
  },
  {
    id: "V003",
    type: "Medium Truck",
    capacity: "5000 kg",
    count: 4,
  },
]

const VehiclesTab = () => {
  const [formData, setFormData] = useState({
    type: "",
    capacity: "",
    count: "",
  })
  const [vehicles, setVehicles] = useState(existingVehicles)
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
      // Update existing vehicle
      setVehicles(
        vehicles.map((vehicle) =>
          vehicle.id === editingId
            ? {
                ...vehicle,
                type: formData.type,
                capacity: formData.capacity,
                count: Number.parseInt(formData.count),
              }
            : vehicle,
        ),
      )
      setEditingId(null)
    } else {
      // Add new vehicle
      const newVehicle = {
        id: `V${String(vehicles.length + 1).padStart(3, "0")}`,
        type: formData.type,
        capacity: `${formData.capacity} kg`,
        count: Number.parseInt(formData.count),
      }
      setVehicles([...vehicles, newVehicle])
    }

    // Reset form
    setFormData({
      type: "",
      capacity: "",
      count: "",
    })
  }

  const handleEdit = (vehicle) => {
    setEditingId(vehicle.id)
    setFormData({
      type: vehicle.type,
      capacity: vehicle.capacity.replace(" kg", ""),
      count: vehicle.count.toString(),
    })
  }

  const handleDelete = (id) => {
    setVehicles(vehicles.filter((vehicle) => vehicle.id !== id))
  }

  return (
    <div className="dashboard-tab">
      <div className="card">
        <div className="card-header">
          <h2>Vehicle Management</h2>
          <p>Add, edit, or remove vehicles from your fleet.</p>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label htmlFor="type">Vehicle Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} required>
                <option value="">Select type</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity (kg)</label>
              <input
                id="capacity"
                name="capacity"
                type="text"
                placeholder="e.g. 1000"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="count">Number of Vehicles</label>
              <input
                id="count"
                name="count"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={formData.count}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update Vehicle" : "Add Vehicle"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setEditingId(null)
                    setFormData({ type: "", capacity: "", count: "" })
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="table-container">
            <h3>Your Vehicles</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Count</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.id}</td>
                    <td>{vehicle.type}</td>
                    <td>{vehicle.capacity}</td>
                    <td>{vehicle.count}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(vehicle)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(vehicle.id)}>
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

export default VehiclesTab

