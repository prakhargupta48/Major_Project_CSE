import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function RouteHistoryTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Vehicles</TableHead>
          <TableHead>Locations</TableHead>
          <TableHead>Distance</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routeHistory.map((route) => (
          <TableRow key={route.id}>
            <TableCell className="font-medium">{route.id}</TableCell>
            <TableCell>{route.date}</TableCell>
            <TableCell>{route.vehicles}</TableCell>
            <TableCell>{route.locations}</TableCell>
            <TableCell>{route.distance}</TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                {route.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

