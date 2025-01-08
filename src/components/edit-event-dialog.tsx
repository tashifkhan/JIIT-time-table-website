import React, { useContext, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import UserContext from "../context/userContext";
import { Trash2 } from "lucide-react";

interface EditEventDialogProps {
	isOpen: boolean;
	onClose: () => void;
	day: string;
	time: string;
	currentEvent?: {
		subject_name: string;
		type: "L" | "T" | "P" | "C";
		location: string;
	};
}

export function EditEventDialog({
	isOpen,
	onClose,
	day,
	time,
	currentEvent,
}: EditEventDialogProps) {
	const { editedSchedule, setEditedSchedule } = useContext(UserContext);
	const [formData, setFormData] = React.useState({
		subject_name: currentEvent?.subject_name || "",
		type: currentEvent?.type || "C",
		location: currentEvent?.location || "",
		startTime: time ? time.split("-")[0] || "" : "",
		endTime: time ? time.split("-")[1] || "" : "",
	});

	// Update form when currentEvent changes
	useEffect(() => {
		if (currentEvent) {
			setFormData({
				subject_name: currentEvent.subject_name,
				type: currentEvent.type,
				location: currentEvent.location,
				startTime: time ? time.split("-")[0] || "" : "",
				endTime: time ? time.split("-")[1] || "" : "",
			});
		}
	}, [currentEvent, time]);

	const handleSave = () => {
		if (!editedSchedule) return;

		const updatedSchedule = { ...editedSchedule };
		const newTimeSlot = `${formData.startTime}-${formData.endTime}`;

		// Remove old time slot if it exists
		if (time) {
			const daySchedule = { ...updatedSchedule[day] };
			delete daySchedule[time];
			updatedSchedule[day] = daySchedule;
		}

		// Create or update day if it doesn't exist
		if (!updatedSchedule[day]) {
			updatedSchedule[day] = {};
		}

		// Add the event at the new time
		updatedSchedule[day] = {
			...updatedSchedule[day],
			[newTimeSlot]: {
				subject_name: formData.subject_name,
				type: formData.type,
				location: formData.location,
				isCustom: true,
			},
		};

		setEditedSchedule(updatedSchedule);
		onClose();
	};

	const handleDelete = () => {
		if (!editedSchedule || !time) return;

		const updatedSchedule = { ...editedSchedule };
		const daySchedule = { ...updatedSchedule[day] };
		delete daySchedule[time]; // Remove the time slot

		// If the day is now empty, remove the day
		if (Object.keys(daySchedule).length === 0) {
			delete updatedSchedule[day];
		} else {
			updatedSchedule[day] = daySchedule;
		}

		setEditedSchedule(updatedSchedule);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex justify-between items-center">
						<span>Edit Event</span>
						{currentEvent && (
							<Button
								variant="destructive"
								size="sm"
								onClick={handleDelete}
								className="bg-red-500 hover:bg-red-600"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="space-y-2">
						<label className="text-sm text-gray-500">Time Range</label>
						<div className="grid grid-cols-2 gap-4">
							<Input
								type="time"
								value={formData.startTime}
								onChange={(e) =>
									setFormData({ ...formData, startTime: e.target.value })
								}
								placeholder="Start Time"
							/>
							<Input
								type="time"
								value={formData.endTime}
								onChange={(e) =>
									setFormData({ ...formData, endTime: e.target.value })
								}
								placeholder="End Time"
							/>
						</div>
					</div>
					<Select
						value={formData.type}
						onValueChange={(value: "L" | "T" | "P" | "C") =>
							setFormData({ ...formData, type: value })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Event Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="L">Lecture</SelectItem>
							<SelectItem value="T">Tutorial</SelectItem>
							<SelectItem value="P">Practical</SelectItem>
							<SelectItem value="C">Custom</SelectItem>
						</SelectContent>
					</Select>
					<Input
						placeholder="Event Name"
						value={formData.subject_name}
						onChange={(e) =>
							setFormData({ ...formData, subject_name: e.target.value })
						}
					/>
					<Input
						placeholder="Location"
						value={formData.location}
						onChange={(e) =>
							setFormData({ ...formData, location: e.target.value })
						}
					/>
					<div className="flex justify-end space-x-2">
						<Button variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							onClick={handleSave}
							disabled={
								!formData.startTime ||
								!formData.endTime ||
								!formData.subject_name
							}
						>
							Save
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
