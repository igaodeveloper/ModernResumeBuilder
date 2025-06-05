import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Timeline } from "@/components/ui/timeline";
import { AppointmentWithDetails } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/appointments`],
    enabled: !!user?.id,
  });

  const appointmentHistory = appointments.map((apt: AppointmentWithDetails) => ({
    id: apt.id.toString(),
    title: apt.service.name,
    description: `with ${apt.barber.user.firstName} ${apt.barber.user.lastName}`,
    date: new Date(apt.appointmentDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: apt.status as "completed" | "scheduled" | "cancelled",
  }));

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-48 bg-muted rounded-xl"></div>
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  const favoriteServices = ["Classic Cut", "Beard Trim"];
  const preferredBarbers = ["Mike Johnson", "Alex Thompson"];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                  alt={`${user?.firstName} ${user?.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-muted-foreground mb-4">
                  Member since {new Date().getFullYear()}
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2">
                    <User className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-primary" />
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{appointments.length}</p>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Favorite Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">Classic Cut</p>
            <p className="text-sm text-muted-foreground">Most booked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              Member Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Gold Member
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">Premium benefits</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-foreground mb-3">Favorite Services</h3>
                <div className="flex flex-wrap gap-2">
                  {favoriteServices.map((service) => (
                    <Badge key={service} variant="secondary" className="bg-blue-100 text-blue-800">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-3">Preferred Barbers</h3>
                <div className="flex flex-wrap gap-2">
                  {preferredBarbers.map((barber) => (
                    <Badge key={barber} variant="outline">
                      {barber}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appointment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Appointment History</CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentHistory.length > 0 ? (
              <Timeline items={appointmentHistory} />
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No appointments yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Book your first appointment to get started
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Schedule Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
