"use client"

import { useState, useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SelectItem } from "@/components/ui/select"
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
import { InputField, SelectField } from "@/components/ui/form-fields"
import { roomPatterns, roomSchema, roomStatuses, type RoomFormData } from "@/lib/schemas/admin-schemas"
import { stat } from "fs"

export function AdminRooms() {
  const { rooms, isLoading, error, createRoom, updateRoom, deleteRoom, loadRooms } = useAdminStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<any>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: "",
      entryFee: 10,
      capacity: 100,
      minPlayers: 2,
      pattern: "LINE",
      status: editingRoom? editingRoom.status: "OPEN",
    },
  })

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, data)
        setEditingRoom(null)
      } else {
        await createRoom(data)
        setIsCreateDialogOpen(false)

      }
      reset()
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to save room:", error)
    }
  }

  const handleEdit = (room: any) => {
    setEditingRoom(room)
    reset({
      name: room.name,
      entryFee: room.entryFee,
      capacity: room.capacity,
      minPlayers: room.minPlayers,
      pattern: room.pattern,
      status: room.status
    })
    setIsCreateDialogOpen(true)
  }

  const handleCancel = () => {
    setIsCreateDialogOpen(false)
    setEditingRoom(null)
    reset()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Room Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Create and manage bingo rooms</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={
          (open) => {
            setIsCreateDialogOpen(open)
            if(!open){
              handleCancel()
            }
          }
        }>
          <DialogTrigger asChild>
            <Button disabled={isLoading} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room" : "Create New Room"}</DialogTitle>
              <DialogDescription>
                {editingRoom ? "Update room settings" : "Set up a new bingo room with custom settings"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                label="Room Name"
                placeholder="Enter room name"
                required
                {...register("name")}
                error={errors.name?.message}
              />

              <InputField
                label="Entry Fee ($)"
                type="number"
                step="0.01"
                min="0"
                max="1000"
                placeholder="10.00"
                required
                {...register("entryFee", { valueAsNumber: true })}
                error={errors.entryFee?.message}
              />

              <InputField
                label="Capacity"
                type="number"
                min="1"
                max="500"
                placeholder="100"
                required
                {...register("capacity", { valueAsNumber: true })}
                error={errors.capacity?.message}
              />

              <InputField
                label="Minimum Players"
                type="number"
                min="2"
                placeholder="100"
                required
                {...register("minPlayers", {required: true, valueAsNumber: true })}
                error={errors.minPlayers?.message}
              />

              <Controller
                name="pattern"
                control={control}
                defaultValue="LINE" // important!
                render={({ field }) => (
                  <SelectField
                    label="Winning Pattern"
                    value={field.value}               // <- controlled value
                    onValueChange={field.onChange}    // <- update RHF state
                    error={errors.pattern?.message}
                  >
                    {roomPatterns.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>
                        {pattern.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectField>
                )}
              />


              {editingRoom && (
                <Controller
                  name="status"
                  control={control}
                  defaultValue={editingRoom.status || ""} // make sure to set initial value
                  render={({ field }) => (
                    <SelectField
                      label="Room Status"
                      value={field.value}
                      onValueChange={field.onChange}
                      error={errors.status?.message}
                    >
                      {roomStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectField>
                  )}
                />
              )}

              <div className="mt-3 block">
                    {error && <div className="text-red-700 px-4 py-3 rounded">{error}</div>}
                  </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Saving..." : editingRoom ? "Update Room" : "Create Room"}
                </Button>
                  

              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

      <Card>
  <CardHeader>
    <CardTitle className="text-lg sm:text-xl">All Rooms</CardTitle>
    <CardDescription className="text-sm">Manage existing bingo rooms</CardDescription>
  </CardHeader>
  <CardContent className="p-0 sm:p-6">
    {isLoading ? (
      <div className="text-center py-8">Loading rooms...</div>
    ) : (
      /* Made table responsive with horizontal scroll on mobile */
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              <TableHead className="min-w-[80px]">Entry Fee</TableHead>
              <TableHead className="min-w-[100px]">Min Players</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[100px]">Pattern</TableHead>
              <TableHead className="min-w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No rooms data
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>${room.entryFee}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {room.minPlayers}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {room.capacity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={room.status === "OPEN" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {typeof room.pattern === "string"
                      ? room.pattern
                      : room.pattern || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {/* <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 bg-transparent"
                      >
                        {room.gameStatus === "playing" ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button> */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(room)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteRoom(room.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    )}
  </CardContent>
</Card>

    </div>
  )
}

