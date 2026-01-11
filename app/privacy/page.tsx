import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Privacy Policy - WhatsApp Business",
    description: "Privacy Policy for WhatsApp Business Application",
}

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground mb-8">Last updated: January 11, 2026</p>

                <div className="space-y-6 text-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                        <p className="text-muted-foreground">
                            Welcome to our WhatsApp Business application. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we handle your personal data when you use our WhatsApp Business messaging service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                        <p className="text-muted-foreground mb-2">We collect and process the following information:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>WhatsApp Messages:</strong> Text messages sent and received through WhatsApp Business API</li>
                            <li><strong>Phone Numbers:</strong> Your WhatsApp Business phone number and recipient phone numbers</li>
                            <li><strong>Contact Information:</strong> Contact names associated with phone numbers</li>
                            <li><strong>Message Metadata:</strong> Timestamps, message status (sent, delivered, read), and message IDs</li>
                            <li><strong>Usage Data:</strong> Information about how you interact with our application</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                        <p className="text-muted-foreground mb-2">We use the collected information for:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Providing and maintaining our WhatsApp Business messaging service</li>
                            <li>Storing and displaying your conversation history</li>
                            <li>Sending and receiving WhatsApp messages on your behalf</li>
                            <li>Improving our service and user experience</li>
                            <li>Complying with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">4. Data Storage and Security</h2>
                        <p className="text-muted-foreground">
                            Your messages and contact information are securely stored in our database (Supabase). We implement appropriate
                            technical and organizational security measures to protect your personal data against unauthorized access,
                            alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">5. Data Sharing</h2>
                        <p className="text-muted-foreground mb-2">We share your data with:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li><strong>WhatsApp/Meta:</strong> To send and receive messages through WhatsApp Business API</li>
                            <li><strong>Supabase:</strong> Our database provider for secure data storage</li>
                            <li><strong>Vercel:</strong> Our hosting provider for application deployment</li>
                        </ul>
                        <p className="text-muted-foreground mt-2">
                            We do not sell, rent, or share your personal information with third parties for marketing purposes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
                        <p className="text-muted-foreground">
                            We retain your messages and contact information for as long as necessary to provide our services.
                            You can request deletion of your data at any time by contacting us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
                        <p className="text-muted-foreground mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Access your personal data</li>
                            <li>Correct inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to processing of your data</li>
                            <li>Export your data in a portable format</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">8. WhatsApp Business API</h2>
                        <p className="text-muted-foreground">
                            This application uses the WhatsApp Business API provided by Meta. Your use of WhatsApp messaging is also
                            subject to WhatsApp's Terms of Service and Privacy Policy. Please review Meta's privacy practices at{" "}
                            <a href="https://www.whatsapp.com/legal/privacy-policy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                https://www.whatsapp.com/legal/privacy-policy
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">9. Children's Privacy</h2>
                        <p className="text-muted-foreground">
                            Our service is not intended for children under 13 years of age. We do not knowingly collect personal
                            information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">10. Changes to This Privacy Policy</h2>
                        <p className="text-muted-foreground">
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                            new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">11. Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div className="mt-2 text-muted-foreground">
                            <p>Email: privacy@boostowl.io</p>
                            <p>Website: https://boostowl.io</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
