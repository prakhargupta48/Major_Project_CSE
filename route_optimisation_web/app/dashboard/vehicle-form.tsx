"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

export function VehicleForm() {
  const [formData, setFormData] = useState({
    type: "",
    capacity: "",
    count: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Vehicle data:", formData)
    // Reset form
    setFormData({
      type: "",
      capacity: "",
      count: "",
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="type">Vehicle Type</Label>
            <Select value={formData.type} onValueChange={handleSelectChange}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (kg)</Label>
            <Input
              id="capacity"
              name="capacity"
              type="text"
              placeholder="e.g. 1000"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Number of Vehicles</Label>
            <Input
              id="count"
              name="count"
              type="number"
              min="1"
              placeholder="e.g. 3"
              value={formData.count}
              onChange={handleChange}
            />
          </div>
        </div>
        <Button type="submit">Add Vehicle</Button>
      </form>

      <div>
        <h3 className="mb-4 text-lg font-medium">Your Vehicles</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {existingVehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-medium">{vehicle.id}</TableCell>
                <TableCell>{vehicle.type}</TableCell>
                <TableCell>{vehicle.capacity}</TableCell>
                <TableCell>{vehicle.count}</TableCell>
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

