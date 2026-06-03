'use client';

import { useRouter } from 'next/navigation';
import TopSection from './TopSection';

interface RefundPageProps {
  onNavigate?: (screen: string) => void;
}

export default function RefundPage({ onNavigate }: RefundPageProps = {}) {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full">
        {/* Top Section with Logo */}
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>

        {/* Page Title */}
        <div className="px-4 md:px-6 lg:px-8 mb-6">
          <h1 className="text-white font-bold text-2xl sm:text-3xl">Refund Policy</h1>
          <p className="text-gray-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 lg:px-8 pb-24">
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, #7F8CAA 0%, #5C667C 100%)',
              boxShadow: '0px 4px 4px 0px #00000040'
            }}
          >
            <div className="space-y-6 text-white">
              <section>
                <h2 className="text-xl font-bold mb-3">1. Refund Eligibility</h2>
                <p className="text-sm leading-relaxed mb-4">
                  At Game Creds, we understand that sometimes you may need to request a refund. Refunds are available under the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Failed transactions where payment was deducted but top-up was not completed</li>
                  <li>Duplicate transactions due to technical errors</li>
                  <li>Incorrect game account information provided by the user (subject to verification)</li>
                  <li>Service unavailability or technical issues on our platform</li>
                </ul>
              </section>

              <section>
                <div
                  className="p-4 rounded-lg mb-4"
                  style={{
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    border: '2px solid rgba(255, 193, 7, 0.5)'
                  }}
                >
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#FFC107' }}>⚠️ Important Refund Notice</h3>
                  <p className="text-sm leading-relaxed font-semibold">
                    <strong>All refunds will be credited Coins only. No money refunds will be provided.</strong> When a refund is approved, the equivalent amount will be added to your Game Creds wallet balance in Coins, which can be used for future purchases on our platform.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">2. Non-Refundable Items</h2>
                <p className="text-sm leading-relaxed mb-4">
                  The following are not eligible for refunds:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Successfully completed top-ups and recharges</li>
                  <li>Digital goods that have been delivered and activated</li>
                  <li>Transactions completed more than 7 days ago</li>
                  <li>Refunds requested due to user error in account details</li>
                  <li>Promotional or discounted items (unless specified otherwise)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">3. Refund Process</h2>
                <p className="text-sm leading-relaxed mb-4">
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-4">
                  <li>Contact our customer support team via WhatsApp or email within 48 hours of the transaction</li>
                  <li>Provide your transaction ID, order number, and reason for refund</li>
                  <li>Our team will review your request within 2-3 business days</li>
                  <li>If approved, refunds will be processed to your original payment method within 5-7 business days</li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">4. Refund Timeline</h2>
                <p className="text-sm leading-relaxed mb-4">
                  <strong>All approved refunds will be credited as Coins to your Game Creds wallet balance.</strong> Refunds are typically processed within 5-7 business days after approval. The refunded amount will appear in your wallet as Coins, which can be used for future purchases.
                </p>
                <p className="text-sm leading-relaxed mb-4">
                  <strong>Note:</strong> No money will be refunded to your original payment method (UPI, Credit/Debit Cards, etc.). All refunds are processed exclusively as Coins in your wallet.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">5. Contact Us</h2>
                <p className="text-sm leading-relaxed">
                  For refund requests or inquiries, please contact us:
                </p>
                <ul className="list-none space-y-2 text-sm ml-4 mt-4">
                  <li>📱 WhatsApp: <a href="https://wa.me/9707315156" target="_blank" rel="noopener noreferrer" className="underline">+91 9707315156</a></li>
                  <li>📧 Email: support@zorotopup.com</li>
                  <li>🌐 Website: <a href="https://zorotopup.com" target="_blank" rel="noopener noreferrer" className="underline">www.zorotopup.com</a></li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">6. Dispute Resolution</h2>
                <p className="text-sm leading-relaxed">
                  If you are not satisfied with our refund decision, you may escalate your concern to our support team. We are committed to resolving all disputes fairly and promptly.
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
      </div>
    </div>
  );
}

