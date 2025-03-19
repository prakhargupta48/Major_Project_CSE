const routeHistory = [
  {
    id: "RT001",
    date: "2023-03-15",
    vehicles: 3,
    locations: 12,
    distance: "145 km",
    status: "Completed",
  },
  {
    id: "RT002",
    date: "2023-03-14",
    vehicles: 2,
    locations: 8,
    distance: "98 km",
    status: "Completed",
  },
  {
    id: "RT003",
    date: "2023-03-12",
    vehicles: 4,
    locations: 15,
    distance: "210 km",
    status: "Completed",
  },
  {
    id: "RT004",
    date: "2023-03-10",
    vehicles: 2,
    locations: 7,
    distance: "85 km",
    status: "Completed",
  },
  {
    id: "RT005",
    date: "2023-03-08",
    vehicles: 3,
    locations: 10,
    distance: "120 km",
    status: "Completed",
  },
]

const RouteHistoryTable = () => {
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Vehicles</th>
            <th>Locations</th>
            <th>Distance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {routeHistory.map((route) => (
            <tr key={route.id}>
              <td>{route.id}</td>
              <td>{route.date}</td>
              <td>{route.vehicles}</td>
              <td>{route.locations}</td>
              <td>{route.distance}</td>
              <td>
                <span className="status-badge completed">{route.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RouteHistoryTable

