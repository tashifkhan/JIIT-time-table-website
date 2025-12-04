"use client";
import React, { useState, useEffect, useContext } from "react";
import TimelinePage from "../../components/timeline";
import TimelineLanding from "../../components/timeline-landing";
import UserContext from "../../context/userContext";

const TimelineWrapper: React.FC = () => {
	const { schedule, editedSchedule, setSchedule } = useContext(UserContext);
	const [isLoading, setIsLoading] = useState(true);
	const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

	// Check for cached schedule on mount
	useEffect(() => {
		// If we already have a schedule in context, no need to check storage
		if (schedule || editedSchedule) {
			setIsLoading(false);
			setHasCheckedStorage(true);
			return;
		}

		// Check localStorage for cached schedule
		const checkCachedSchedule = () => {
			try {
				const cached = localStorage.getItem("cachedSchedule");
				if (cached) {
					const parsed = JSON.parse(cached);
					if (
						parsed &&
						typeof parsed === "object" &&
						Object.keys(parsed).length > 0
					) {
						setSchedule(parsed);
					}
				}
			} catch (error) {
				console.error("Error parsing cached schedule:", error);
			} finally {
				setIsLoading(false);
				setHasCheckedStorage(true);
			}
		};

		checkCachedSchedule();
	}, [schedule, editedSchedule, setSchedule]);

	// Show loading state while checking for cached schedule
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F0BB78] mb-4"></div>
					<p className="text-lg text-[#F0BB78]">Loading your schedule...</p>
				</div>
			</div>
		);
	}

	// Determine what to show based on schedule availability
	const displaySchedule = editedSchedule || schedule;
	const hasSchedule =
		displaySchedule &&
		typeof displaySchedule === "object" &&
		Object.keys(displaySchedule).length > 0;

	// Show timeline landing page if no schedule is available
	if (!hasSchedule && hasCheckedStorage) {
		return <TimelineLanding />;
	}

	// Show the actual timeline page if schedule exists
	return <TimelinePage />;
};

export default TimelineWrapper;
