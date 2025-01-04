"use client";

import { motion } from "framer-motion";
import { DownloadButtons } from "./download-buttons";
import { GoogleCalendarButton } from "./google-calendar-button";
import { WeekSchedule } from "../types/schedule";

interface ActionButtonsProps {
  schedule: WeekSchedule;
}

export function ActionButtons({ schedule }: ActionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <DownloadButtons />
      <GoogleCalendarButton schedule={schedule} />
    </motion.div>
  );
}