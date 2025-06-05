import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { QRPaymentModal } from "@/components/ui/qr-payment-modal";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Service, BarberWithUser } from "@shared/schema";

interface ScheduleProps {
  selectedServiceId?: number;
  onSuccess: () => void;
}

const steps = [
  { id: 1, name: "Service", label: "Choose Service" },
  { id: 2, name: "Barber", label: "Select Barber" },
  { id: 3, name: "DateTime", label: "Pick Date & Time" },
  { id: 4, name: "Confirm", label: "Confirm Booking" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

export default function Schedule({ selectedServiceId, onSuccess }: ScheduleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<BarberWithUser | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const { data: barbers = [] } = useQuery({
    queryKey: ["/api/barbers"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      return apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/appointments`] });
      setShowPaymentModal(true);
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Unable to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Set selected service if provided
  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const service = services.find((s: Service) => s.id === selectedServiceId);
      if (service) {
        setSelectedService(service);
        setCurrentStep(2);
      }
    }
  }, [selectedServiceId, services]);

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setTimeout(nextStep, 300);
  };

  const handleBarberSelect = (barber: BarberWithUser) => {
    setSelectedBarber(barber);
    setTimeout(nextStep, 300);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const confirmBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !user) {
      return;
    }

    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    createAppointmentMutation.mutate({
      customerId: user.id,
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      appointmentDate: appointmentDateTime.toISOString(),
      totalPrice: selectedService.price,
      status: "scheduled",
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id <= currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium transition-colors ${
                      step.id <= currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Service</h2>
              <p className="text-muted-foreground">Select the service you'd like to book</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service: Service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                    selectedService?.id === service.id
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{service.name}</h3>
                      <Badge variant="secondary">${service.price}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {service.duration} minutes
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Barber Selection */}
        {currentStep === 2 && (
          <motion.div
            key="barber"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Barber</h2>
              <p className="text-muted-foreground">Select your preferred barber</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {barbers.map((barber: BarberWithUser) => (
                <Card
                  key={barber.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                    selectedBarber?.id === barber.id
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  }`}
                  onClick={() => handleBarberSelect(barber)}
                >
                  <CardContent className="p-6 text-center">
                    <img
                      src={barber.user.profileImageUrl || "/placeholder-avatar.jpg"}
                      alt={`${barber.user.firstName} ${barber.user.lastName}`}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-avatar.jpg";
                      }}
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      {barber.user.firstName} {barber.user.lastName}
                    </h3>
                    <div className="flex justify-center items-center gap-1 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(Number(barber.rating)) ? "★" : "☆"}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">
                        {barber.rating} ({barber.reviewCount} reviews)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {barber.experience} years experience
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={previousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Date & Time Selection */}
        {currentStep === 3 && (
          <motion.div
            key="datetime"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Select Date & Time</h2>
              <p className="text-muted-foreground">Choose your preferred appointment time</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Times</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(time)}
                        disabled={!selectedDate}
                        className={selectedTime === time ? "bg-primary" : ""}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={previousStep}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={!selectedDate || !selectedTime}
                className="bg-primary hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Confirm Your Appointment</h2>
              <p className="text-muted-foreground">Please review your booking details</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b">
                    <span className="font-medium text-muted-foreground">Service:</span>
                    <span className="font-semibold">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b">
                    <span className="font-medium text-muted-foreground">Barber:</span>
                    <span className="font-semibold">
                      {selectedBarber?.user.firstName} {selectedBarber?.user.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b">
                    <span className="font-medium text-muted-foreground">Date:</span>
                    <span className="font-semibold">
                      {selectedDate?.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b">
                    <span className="font-medium text-muted-foreground">Time:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b">
                    <span className="font-medium text-muted-foreground">Duration:</span>
                    <span className="font-semibold">{selectedService?.duration} minutes</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="font-medium text-muted-foreground">Total Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${selectedService?.price}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="outline" onClick={previousStep}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    onClick={confirmBooking}
                    disabled={createAppointmentMutation.isPending}
                    className="bg-secondary hover:bg-secondary/90"
                  >
                    {createAppointmentMutation.isPending ? "Booking..." : "Confirm Booking"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
