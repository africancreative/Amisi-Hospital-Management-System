import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function SuspendedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Account Suspended
                </h1>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Access to this hospital's dashboard has been suspended by the Amisi Cloud system administrator. Please contact support or your account manager for more details.
                </p>

                <div className="space-y-4">
                    <Link
                        href="mailto:support@amisi.com"
                        className="block w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Contact Support
                    </Link>

                    <Link
                        href="/"
                        className="block w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>

            <p className="mt-8 text-sm text-gray-500">
                Amisi Hospital Management System © 2026
            </p>
        </div>
    );
}
