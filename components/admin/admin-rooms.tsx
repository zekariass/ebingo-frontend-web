"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Play, Pause, Users } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"

export function AdminRooms() {
  const { rooms, isLoading, error, createRoom, updateRoom, deleteRoom, loadRooms } = useAdminStore()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)

  const [newRoom, setNewRoom] = useState({
    name: "",
    fee: "",
    capacity: "",
    minPlayers: "",
    pattern: "line",
  })

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const handleCreateRoom = async () => {
    await createRoom({
      name: newRoom.name,
      fee: Number.parseFloat(newRoom.fee),
      capacity: Number.parseInt(newRoom.capacity),
      pattern: newRoom.pattern as any,
    })
    setNewRoom({ name: "", fee: "", capacity: "", minPlayers: "", pattern: "line" })
    setIsCreateDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Room Management</h1>
          <p className="text-muted-foreground">Create and manage bingo rooms</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Room</DialogTitle>
              <DialogDescription>Set up a new bingo room with custom settings</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Room Name</Label>
                <Input
                  id="name"
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="Enter room name"
                />
              </div>

              <div>
                <Label htmlFor="fee">Entry Fee ($)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={newRoom.fee}
                  onChange={(e) => setNewRoom({ ...newRoom, fee: e.target.value })}
                  placeholder="10.00"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newRoom.capacity}
                  onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Minimum Players</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newRoom.minPlayers}
                  onChange={(e) => setNewRoom({ ...newRoom, minPlayers: e.target.value })}
                  placeholder="5"
                />
              </div>

              <div>
                <Label htmlFor="pattern">Winning Pattern</Label>
                <Select value={newRoom.pattern} onValueChange={(value) => setNewRoom({ ...newRoom, pattern: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="line-and-four-corners">Line + Four Corners</SelectItem>
                    <SelectItem value="four-corners">Four Corners</SelectItem>
                    <SelectItem value="full-house">Full House</SelectItem>
                    <SelectItem value="x-pattern">X Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRoom} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Room"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
          <CardDescription>Manage existing bingo rooms</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading rooms...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pattern</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>${room.fee}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {room.players}/{room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={room.status === "active" ? "default" : "secondary"}>{room.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {typeof room.pattern === "string" ? room.pattern : room.pattern?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          {room.gameStatus === "playing" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteRoom(room.id)} disabled={isLoading}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
