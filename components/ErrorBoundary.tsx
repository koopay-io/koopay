"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Log error to console in development
		if (process.env.NODE_ENV === "development") {
			console.error("ErrorBoundary caught an error:", error, errorInfo);
		}
		// In production, you'd send this to an error tracking service
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			// Default error UI
			return (
				<div className='flex items-center justify-center min-h-screen bg-gray-50 p-4'>
					<div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center'>
						<AlertTriangle className='h-12 w-12 text-red-500 mx-auto mb-4' />
						<h2 className='text-xl font-semibold text-gray-900 mb-2'>
							Something went wrong
						</h2>
						<p className='text-gray-600 mb-4'>
							We are sorry, but something unexpected happened. Please try
							refreshing the page.
						</p>
						{process.env.NODE_ENV === "development" &&
							this.state.error && (
								<details className='text-left text-sm text-gray-500 mb-4 p-3 bg-gray-100 rounded'>
									<summary className='cursor-pointer font-medium'>
										Error details
									</summary>
									<pre className='mt-2 overflow-auto'>
										{this.state.error.toString()}
									</pre>
								</details>
							)}
						<div className='flex gap-2 justify-center'>
							<Button
								onClick={this.handleReset}
								variant='outline'>
								Try Again
							</Button>
							<Button onClick={() => (window.location.href = "/")}>
								Go Home
							</Button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
