import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Terms of Service - WhatsApp Business",
    description: "Terms of Service for WhatsApp Business Application",
}

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold text-foreground mb-6">Terms of Service</h1>
                <p className="text-sm text-muted-foreground mb-8">Last updated: January 11, 2026</p>

                <div className="space-y-6 text-foreground">
                    <section>
                        <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground">
                            By accessing and using this WhatsApp Business application, you accept and agree to be bound by the terms
                            and provisions of this agreement. If you do not agree to these terms, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
                        <p className="text-muted-foreground">
                            This application provides a web-based interface for managing WhatsApp Business messaging through the
                            WhatsApp Business API. The service allows you to send and receive messages, manage conversations,
                            and store message history.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">3. WhatsApp Business API Compliance</h2>
                        <p className="text-muted-foreground mb-2">
                            By using this service, you agree to comply with:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>WhatsApp Business API Terms of Service</li>
                            <li>WhatsApp Business Policy</li>
                            <li>Meta Platform Terms</li>
                            <li>All applicable laws and regulations regarding messaging and data privacy</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">4. User Responsibilities</h2>
                        <p className="text-muted-foreground mb-2">You agree to:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Use the service only for lawful purposes</li>
                            <li>Not send spam, unsolicited messages, or engage in harassment</li>
                            <li>Respect the privacy and rights of message recipients</li>
                            <li>Obtain necessary consent before messaging customers</li>
                            <li>Comply with opt-out requests promptly</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">5. Prohibited Activities</h2>
                        <p className="text-muted-foreground mb-2">You may not:</p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                            <li>Send spam or bulk unsolicited messages</li>
                            <li>Impersonate others or provide false information</li>
                            <li>Violate any laws or regulations</li>
                            <li>Interfere with or disrupt the service</li>
                            <li>Attempt to gain unauthorized access to the system</li>
                            <li>Use the service for fraudulent purposes</li>
                            <li>Share or resell access to the service without permission</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">6. Message Content</h2>
                        <p className="text-muted-foreground">
                            You are solely responsible for the content of messages you send through this service. We do not monitor,
                            edit, or control the content of your messages, but we reserve the right to remove content that violates
                            these terms or applicable laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">7. Data and Privacy</h2>
                        <p className="text-muted-foreground">
                            Your use of this service is also governed by our Privacy Policy. We collect and process data as described
                            in the Privacy Policy. You are responsible for complying with all applicable data protection laws when
                            using this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">8. Service Availability</h2>
                        <p className="text-muted-foreground">
                            We strive to provide reliable service but do not guarantee uninterrupted access. The service may be
                            temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not
                            liable for any damages resulting from service interruptions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">9. Intellectual Property</h2>
                        <p className="text-muted-foreground">
                            All content, features, and functionality of this application are owned by us or our licensors and are
                            protected by copyright, trademark, and other intellectual property laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">10. Limitation of Liability</h2>
                        <p className="text-muted-foreground">
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special,
                            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
                            indirectly, or any loss of data, use, goodwill, or other intangible losses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">11. Termination</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to suspend or terminate your access to the service at any time, with or without
                            cause, with or without notice. You may also terminate your use of the service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">12. Changes to Terms</h2>
                        <p className="text-muted-foreground">
                            We reserve the right to modify these terms at any time. We will notify users of any material changes
                            by updating the "Last updated" date. Your continued use of the service after changes constitutes
                            acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">13. Governing Law</h2>
                        <p className="text-muted-foreground">
                            These terms shall be governed by and construed in accordance with applicable laws, without regard to
                            conflict of law provisions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-3">14. Contact Information</h2>
                        <p className="text-muted-foreground">
                            If you have any questions about these Terms of Service, please contact us at:
                        </p>
                        <div className="mt-2 text-muted-foreground">
                            <p>Email: support@boostowl.io</p>
                            <p>Website: https://boostowl.io</p>
                        </div>
                    </section>

                    <section className="mt-8 pt-6 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                            By using this WhatsApp Business application, you acknowledge that you have read, understood, and agree
                            to be bound by these Terms of Service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
