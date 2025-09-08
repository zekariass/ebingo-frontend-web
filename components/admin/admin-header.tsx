"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, RefreshCw } from "lucide-react"
import { useAdminStore } from "@/lib/stores/admin-store"

export function AdminHeader() {
  const { systemStatus, notifications, refreshData } = useAdminStore()

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">System Status</h2>
          <Badge variant={systemStatus === "healthy" ? "default" : "destructive"}>{systemStatus}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" className="relative bg-transparent">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">{notifications}</Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
