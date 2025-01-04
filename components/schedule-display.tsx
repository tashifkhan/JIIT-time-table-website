"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { WeekSchedule } from "../types/schedule";
import { Clock, MapPin, User } from "lucide-react";
import { ActionButtons } from "./action-buttons";

interface ScheduleDisplayProps {
  schedule: WeekSchedule;
}

export function ScheduleDisplay({ schedule }: ScheduleDisplayProps) {
  const typeColors = {
    L: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20",
    T: "bg-pink-500/10 border-pink-500/20 hover:bg-pink-500/20",
    P: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20",
  };

  const typeLabels = {
    L: "Lecture",
    T: "Tutorial",
    P: "Practical",
  };

  return (
    <>
      <div id="schedule-display" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* ... existing schedule display code ... */}
      </div>
      <ActionButtons schedule={schedule} />
    </>
  );
}