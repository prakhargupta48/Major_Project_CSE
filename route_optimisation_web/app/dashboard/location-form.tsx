"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function LocationForm() {
  const [formData, setFormData] = useState({
    address: "",
    demand: "",
    latitude: "",
    longitude: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Location data:", formData)
    // Reset form
    setFormData({
      address: "",
      demand: "",
      latitude: "",
      longitude: "",
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="Enter full address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="demand">Demand Capacity (kg)</Label>
            <Input
              id="demand"
              name="demand"
              type="text"
              placeholder="e.g. 200"
              value={formData.demand}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              type="text"
              placeholder="e.g. 40.7128"
              value={formData.latitude}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              type="text"
              placeholder="e.g. -74.0060"
              value={formData.longitude}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button type="submit">Add Location</Button>
      </form>

      <div>
        <h3 className="mb-4 text-lg font-medium">Your Locations</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Demand</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {existingLocations.map((location) => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.id}</TableCell>
                <TableCell>{location.address}</TableCell>
                <TableCell>{location.demand}</TableCell>
                <TableCell>{`${location.latitude}, ${location.longitude}`}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

