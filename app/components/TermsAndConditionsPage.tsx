'use client';

import { useRouter } from 'next/navigation';
import TopSection from './TopSection';

interface TermsAndConditionsPageProps {
  onNavigate?: (screen: string) => void;
}

export default function TermsAndConditionsPage({ onNavigate }: TermsAndConditionsPageProps = {}) {
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
          <h1 className="text-white font-bold text-2xl sm:text-3xl">Terms & Conditions</h1>
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
                <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
                <p className="text-sm leading-relaxed">
                  By accessing and using Game Creds (zorotopup.com), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">2. Service Description </h2>
                <p className="text-sm leading-relaxed mb-4">
                  Game Creds is a digital platform that provides game top-up and recharge services. We facilitate the purchase of in-game currency, items, and subscriptions for various gaming platforms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">3. User Account</h2>
                <p className="text-sm leading-relaxed mb-4">
                  To use our services, you must:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Create an account with accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be at least 18 years old or have parental consent</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">4. Payment Terms</h2>
                <p className="text-sm leading-relaxed mb-4">
                  All payments must be made through our secure payment gateway. By making a payment, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Pay the exact amount displayed at checkout</li>
                  <li>Provide accurate payment information</li>
                  <li>Authorize us to charge your payment method</li>
                  <li>Understand that all sales are final unless otherwise stated in our Refund Policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">5. User Responsibilities</h2>
                <p className="text-sm leading-relaxed mb-4">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm ml-4">
                  <li>Providing correct game account information (Player ID, Server, etc.)</li>
                  <li>Ensuring you have the right to use the game account</li>
                  <li>Not using our service for any illegal or unauthorized purpose</li>
                  <li>Not attempting to gain unauthorized access to our systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">6. Service Availability</h2>
                <p className="text-sm leading-relaxed">
                  We strive to provide uninterrupted service but do not guarantee 100% uptime. We reserve the right to modify, suspend, or discontinue any part of our service at any time without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
                <p className="text-sm leading-relaxed">
                  Game Creds shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific transaction in question.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">8. Intellectual Property</h2>
                <p className="text-sm leading-relaxed">
                  All content, logos, and materials on Game Creds are the property of Game Creds or its licensors and are protected by copyright and trademark laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">9. Changes to Terms</h2>
                <p className="text-sm leading-relaxed">
                  We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">10. Contact Information</h2>
                <p className="text-sm leading-relaxed">
                  For questions about these Terms & Conditions, please contact us:
                </p>
                <ul className="list-none space-y-2 text-sm ml-4 mt-4">
                  <li>📱 WhatsApp: <a href="https://wa.me/9707315156" target="_blank" rel="noopener noreferrer" className="underline">+91 9707315156</a></li>
                  <li>📧 Email: support@zorotopup.com</li>
                  <li>🌐 Website: <a href="https://zorotopup.com" target="_blank" rel="noopener noreferrer" className="underline">www.zorotopup.com</a></li>
                </ul>
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

