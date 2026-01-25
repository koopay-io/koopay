"use client";

import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type ErrorType = "error" | "warning" | "info";

interface ErrorAlertProps {
	type?: ErrorType;
	title?: string;
	message: string;
	onRetry?: () => void;
	onDismiss?: () => void;
	helpLink?: string;
	className?: string;
}

export function ErrorAlert({
	type = "error",
	title,
	message,
	onRetry,
	onDismiss,
	helpLink,
	className,
}: ErrorAlertProps) {
	const icons = {
		error: AlertCircle,
		warning: AlertTriangle,
		info: Info,
	};

	const styles = {
		error: "bg-red-50 border-red-200 text-red-800",
		warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
		info: "bg-blue-50 border-blue-200 text-blue-800",
	};

	const Icon = icons[type];

	return (
		<div
			className={cn("rounded-lg border p-4", styles[type], className)}
			role='alert'>
			<div className='flex'>
				<div className='flex-shrink-0'>
					<Icon className='h-5 w-5' />
				</div>
				<div className='ml-3 flex-1'>
					{title && <h3 className='text-sm font-medium mb-1'>{title}</h3>}
					<p className='text-sm'>{message}</p>

					{(onRetry || helpLink) && (
						<div className='mt-4 flex gap-2'>
							{onRetry && (
								<Button
									onClick={onRetry}
									variant='outline'
									size='sm'
									className='h-8'>
									Retry
								</Button>
							)}
							{helpLink && (
								<Button
									onClick={() => window.open(helpLink, "_blank")}
									variant='ghost'
									size='sm'
									className='h-8'>
									Get Help
								</Button>
							)}
						</div>
					)}
				</div>
				{onDismiss && (
					<div className='ml-auto pl-3'>
						<button
							onClick={onDismiss}
							className='inline-flex rounded-md p-1.5 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2'>
							<span className='sr-only'>Dismiss</span>
							<X className='h-5 w-5' />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
