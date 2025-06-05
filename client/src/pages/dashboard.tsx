import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, TrendingUp, CheckCircle, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Timeline } from "@/components/ui/timeline";
import { AppointmentWithDetails } from "@shared/schema";

interface DashboardProps {
  onSchedule: () => void;
}

export default function Dashboard({ onSchedule }: DashboardProps) {
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/appointments`],
    enabled: !!user?.id,
  });

  const nextAppointment = appointments.find(
    (apt: AppointmentWithDetails) => 
      apt.status === "scheduled" && new Date(apt.appointmentDate) > new Date()
  );

  const recentAppointments = appointments
    .filter((apt: AppointmentWithDetails) => apt.status === "completed")
    .slice(0, 3)
    .map((apt: AppointmentWithDetails) => ({
      id: apt.id.toString(),
      title: `${apt.service.name}`,
      description: `with ${apt.barber.user.firstName} ${apt.barber.user.lastName}`,
      date: new Date(apt.appointmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "completed" as const,
    }));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-muted-foreground">Ready for your next great haircut?</p>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Next Appointment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-hover border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Next Appointment</CardTitle>
              <Calendar className="h-8 w-8 text-primary bg-primary/10 rounded-lg p-1.5" />
            </CardHeader>
            <CardContent>
              {nextAppointment ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(nextAppointment.appointmentDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at{" "}
                    {new Date(nextAppointment.appointmentDate).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="font-medium">{nextAppointment.service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    with {nextAppointment.barber.user.firstName} {nextAppointment.barber.user.lastName}
                  </p>
                  <Button variant="link" className="p-0 h-auto text-primary">
                    View Details
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Button
                    onClick={onSchedule}
                    variant="link"
                    className="p-0 h-auto text-primary"
                  >
                    Schedule Now
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Services Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-hover border-l-4 border-l-secondary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recommended</CardTitle>
              <Star className="h-8 w-8 text-secondary bg-secondary/10 rounded-lg p-1.5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">Deluxe Grooming Package</p>
                <p className="text-sm text-muted-foreground">
                  Cut + Beard + Wash + Style
                </p>
                <p className="text-2xl font-bold text-secondary">$65</p>
                <Button variant="link" className="p-0 h-auto text-secondary">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="card-hover border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Your Stats</CardTitle>
              <TrendingUp className="h-8 w-8 text-accent bg-accent/10 rounded-lg p-1.5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Member since {user?.createdAt ? new Date().getFullYear() : "2023"}
                </p>
                <p className="font-medium">{appointments.length} Total Visits</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < 4 ? "text-yellow-400 fill-current" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <Button variant="link" className="p-0 h-auto text-accent">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAppointments.length > 0 ? (
              <Timeline items={recentAppointments} />
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Book your first appointment to get started
                </p>
                <Button onClick={onSchedule} className="bg-primary hover:bg-primary/90">
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
