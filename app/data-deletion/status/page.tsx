import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Data Deletion Status - WhatsApp Business",
    description: "Check the status of your data deletion request",
}

export default function DataDeletionStatusPage({
    searchParams,
}: {
    searchParams: { id?: string }
}) {
    const confirmationCode = searchParams.id

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-card rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-foreground mb-6">Data Deletion Status</h1>

                {confirmationCode ? (
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                                ✓ Deletion Request Processed
                            </h2>
                            <p className="text-green-700 dark:text-green-300">
                                Your data deletion request has been successfully processed.
                            </p>
                        </div>

                        <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-2">Confirmation Code:</p>
                            <p className="font-mono text-sm bg-background px-3 py-2 rounded border border-border">
                                {confirmationCode}
                            </p>
                        </div>

                        <div className="space-y-3 text-muted-foreground">
                            <h3 className="font-semibold text-foreground">What data was deleted:</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>All WhatsApp messages associated with your account</li>
                                <li>Contact information and conversation history</li>
                                <li>Message metadata and timestamps</li>
                            </ul>

                            <h3 className="font-semibold text-foreground mt-6">Important notes:</h3>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>This deletion is permanent and cannot be undone</li>
                                <li>Data deletion may take up to 90 days to complete across all systems</li>
                                <li>Some data may be retained for legal or regulatory compliance</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                No Confirmation Code
                            </h2>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                Please provide a valid confirmation code to check your deletion status.
                            </p>
                        </div>

                        <div className="text-muted-foreground">
                            <h3 className="font-semibold text-foreground mb-2">How to request data deletion:</h3>
                            <ol className="list-decimal list-inside space-y-2 ml-4">
                                <li>Go to your Facebook account settings</li>
                                <li>Navigate to "Your Facebook Information"</li>
                                <li>Select "Delete Your Account and Information"</li>
                                <li>Follow the prompts to request deletion</li>
                            </ol>
                        </div>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        For questions about data deletion, please contact us at{" "}
                        <a href="mailto:privacy@boostowl.io" className="text-blue-600 hover:underline">
                            privacy@boostowl.io
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
