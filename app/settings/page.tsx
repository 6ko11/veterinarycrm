import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input type="text" id="clinicName" placeholder="Enter clinic name" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input type="text" id="address" placeholder="Enter clinic address" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input type="tel" id="phone" placeholder="Enter clinic phone number" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Enter clinic email" />
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

