import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Data Deletion Instructions - WhatsApp Business",
    description: "How to request deletion of your personal data",
}

export default function DataDeletionInstructionsPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-foreground mb-6">Data Deletion Instructions</h1>
                <p className="text-muted-foreground mb-8">
                    Learn how to request deletion of your personal data from our WhatsApp Business application.
                </p>

                <div className="space-y-8 text-foreground">
                    {/* Method 1: Facebook Account Deletion */}
                    <section className="bg-muted rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">1</span>
                            Delete Through Facebook Account
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            If you have a Facebook account linked to WhatsApp, deleting your Facebook account will automatically trigger data deletion.
                        </p>
                        <ol className="list-decimal list-inside space-y-3 text-muted-foreground ml-4">
                            <li>Go to <a href="https://www.facebook.com/settings" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Facebook Settings</a></li>
                            <li>Click on "Your Facebook Information"</li>
                            <li>Select "Deactivation and Deletion"</li>
                            <li>Choose "Delete Account"</li>
                            <li>Click "Continue to Account Deletion"</li>
                            <li>Follow the prompts to confirm deletion</li>
                        </ol>
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Note:</strong> This will delete your Facebook account and all associated data, including WhatsApp Business messages.
                            </p>
                        </div>
                    </section>

                    {/* Method 2: Email Request */}
                    <section className="bg-muted rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">2</span>
                            Request via Email
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            You can request data deletion directly by contacting us via email.
                        </p>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold mb-2">Send an email to:</p>
                                <a href="mailto:privacy@boostowl.io" className="text-blue-600 hover:underline text-lg">
                                    privacy@boostowl.io
                                </a>
                            </div>
                            <div>
                                <p className="font-semibold mb-2">Include the following information:</p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>Subject: "Data Deletion Request"</li>
                                    <li>Your WhatsApp phone number</li>
                                    <li>Your name (as registered)</li>
                                    <li>Reason for deletion (optional)</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    <strong>Response Time:</strong> We will process your request within 30 days and send you a confirmation email.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* What Data Gets Deleted */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">What Data Will Be Deleted?</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-3">✓ Data We Will Delete</h3>
                                <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                                    <li>• All WhatsApp messages (sent and received)</li>
                                    <li>• Contact information and names</li>
                                    <li>• Conversation history</li>
                                    <li>• Message timestamps and metadata</li>
                                    <li>• Message status information</li>
                                </ul>
                            </div>
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">⚠ Data We May Retain</h3>
                                <ul className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
                                    <li>• Legal compliance records (if required by law)</li>
                                    <li>• Aggregated, anonymized analytics</li>
                                    <li>• Backup copies (deleted within 90 days)</li>
                                    <li>• Fraud prevention records</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Deletion Timeline</h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-semibold">
                                    1
                                </div>
                                <div>
                                    <p className="font-semibold">Request Received</p>
                                    <p className="text-sm text-muted-foreground">We acknowledge your deletion request within 48 hours</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-semibold">
                                    2
                                </div>
                                <div>
                                    <p className="font-semibold">Processing (1-30 days)</p>
                                    <p className="text-sm text-muted-foreground">We verify your identity and process the deletion request</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-semibold">
                                    3
                                </div>
                                <div>
                                    <p className="font-semibold">Deletion Complete (30-90 days)</p>
                                    <p className="text-sm text-muted-foreground">All data is permanently deleted from our systems and backups</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0 font-semibold">
                                    ✓
                                </div>
                                <div>
                                    <p className="font-semibold">Confirmation Sent</p>
                                    <p className="text-sm text-muted-foreground">You receive confirmation that your data has been deleted</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Important Notes */}
                    <section className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-4 text-orange-800 dark:text-orange-200">Important Notes</h2>
                        <ul className="space-y-3 text-orange-700 dark:text-orange-300">
                            <li className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span><strong>Permanent Action:</strong> Data deletion is permanent and cannot be undone</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span><strong>Service Access:</strong> After deletion, you will lose access to all message history</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span><strong>WhatsApp Data:</strong> This only deletes data from our application, not from WhatsApp's servers</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span><strong>Legal Obligations:</strong> Some data may be retained to comply with legal requirements</span>
                            </li>
                        </ul>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">Your Data Rights</h2>
                        <p className="text-muted-foreground mb-4">
                            Under data protection laws (GDPR, CCPA, etc.), you have the following rights:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">✓ Right to Access</h3>
                                <p className="text-sm text-muted-foreground">Request a copy of your personal data</p>
                            </div>
                            <div className="border border-border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">✓ Right to Rectification</h3>
                                <p className="text-sm text-muted-foreground">Correct inaccurate personal data</p>
                            </div>
                            <div className="border border-border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">✓ Right to Erasure</h3>
                                <p className="text-sm text-muted-foreground">Request deletion of your data</p>
                            </div>
                            <div className="border border-border rounded-lg p-4">
                                <h3 className="font-semibold mb-2">✓ Right to Portability</h3>
                                <p className="text-sm text-muted-foreground">Export your data in a portable format</p>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section className="border-t border-border pt-6">
                        <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
                        <p className="text-muted-foreground mb-4">
                            If you have questions about data deletion or need assistance, please contact us:
                        </p>
                        <div className="bg-muted rounded-lg p-4 space-y-2">
                            <p><strong>Email:</strong> <a href="mailto:privacy@boostowl.io" className="text-blue-600 hover:underline">privacy@boostowl.io</a></p>
                            <p><strong>Support:</strong> <a href="mailto:support@boostowl.io" className="text-blue-600 hover:underline">support@boostowl.io</a></p>
                            <p><strong>Website:</strong> <a href="https://boostowl.io" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://boostowl.io</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
