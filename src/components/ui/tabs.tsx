import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.List>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-[#F0BB78]/30 shadow-lg p-1 text-[#F0BB78]",
			"data-[orientation=vertical]:flex-col data-[orientation=vertical]:h-auto data-[orientation=vertical]:w-full data-[orientation=vertical]:rounded-xl",
			"data-[orientation=horizontal]:h-12 data-[orientation=horizontal]:w-full",
			className
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-2 text-base font-semibold transition-all duration-200 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0BB78] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-[#F0BB78]/80 hover:text-[#F0BB78] data-[state=active]:bg-[#F0BB78]/20 data-[state=active]:text-[#F0BB78] data-[state=active]:shadow-md data-[state=active]:border-b-2 data-[state=active]:border-[#F0BB78]",
			"data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:data-[state=active]:border-b-0 data-[orientation=vertical]:data-[state=active]:border-l-2 data-[orientation=vertical]:data-[state=active]:border-b-0 data-[orientation=vertical]:rounded-lg",
			"data-[orientation=horizontal]:data-[state=active]:border-b-2 data-[orientation=horizontal]:data-[state=active]:border-l-0",
			className
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F0BB78] focus-visible:ring-offset-2",
			className
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
