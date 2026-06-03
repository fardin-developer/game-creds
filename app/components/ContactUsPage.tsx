'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import TopSection from './TopSection';

interface ContactUsPageProps {
  onNavigate?: (screen: string) => void;
}

export default function ContactUsPage({ onNavigate }: ContactUsPageProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    issue: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Your query has been submitted!');
    setFormData({ email: '', phone: '', name: '', issue: '' }); // Clear form
    if (onNavigate) {
      onNavigate('home');
    } else {
      router.push('/'); // Navigate back to dashboard after submission
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-0 m-0" style={{ backgroundColor: '#232426' }}>
      {/* Desktop Container */}
      <div className="w-full">
        {/* Top Section with Logo */}
        <div className="relative z-10">
          <TopSection showLogo={true} onNavigate={onNavigate} />
        </div>

        {/* Page Title */}
        <div>
          <h1
            className="text-white font-bold text-2xl sm:text-3xl text-center"
          >
            Contact US
          </h1>
        </div>

        {/* Illustration Section */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <div className="flex flex-col items-center">
            {/* Main Illustration */}
            <div className="relative">
              <Image
                src="/support.png"
                alt="Customer Support"
                width={400}
                height={200}
                className="object-contain"
                style={{
                  color: 'transparent',
                  filter: 'grayscale(100%)'
                }}
              />
            </div>

            {/* Sub-heading */}
            <h2
              className="text-white font-medium mb-8 text-base sm:text-lg"
              style={{
                marginTop: '-50px'
              }}
            >
              How can we help you?
            </h2>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="px-4 md:px-6 lg:px-8 mb-8">
          <div
            className="p-3 rounded-2xl"
            style={{
              background: 'linear-gradient(90deg, #7F8CAA 0%, #333844 100%)',
              boxShadow: '0px 4px 4px 0px #00000040'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="contact-email" className="text-white text-sm mb-2 block">Enter your email</label>
                <input
                  type="email"
                  name="email"
                  id="contact-email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-2 py-2 rounded-lg text-black placeholder-gray-500"
                  style={{ backgroundColor: '#D9D9D9' }}
                  required
                />
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="contact-phone" className="text-white text-sm mb-2 block">Enter your phone number</label>
                <input
                  type="tel"
                  name="phone"
                  id="contact-phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-2 py-2 rounded-lg text-black placeholder-gray-500"
                  style={{ backgroundColor: '#D9D9D9' }}
                  required
                />
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="contact-name" className="text-white text-sm mb-2 block">Enter your name</label>
                <input
                  type="text"
                  name="name"
                  id="contact-name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-2 py-2 rounded-lg text-black placeholder-gray-500"
                  style={{ backgroundColor: '#D9D9D9' }}
                  required
                />
              </div>

              {/* Issue Field */}
              <div>
                <label htmlFor="contact-issue" className="text-white text-sm mb-2 block">Explain your issue</label>
                <textarea
                  name="issue"
                  id="contact-issue"
                  value={formData.issue}
                  onChange={handleInputChange}
                  placeholder="Explain your issue"
                  rows={4}
                  className="w-full px-2 py-2 rounded-lg text-black placeholder-gray-500 resize-none"
                  style={{ backgroundColor: '#D9D9D9' }}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="text-white font-bold w-full max-w-sm py-3 sm:py-4 text-base sm:text-lg"
                  style={{
                    backgroundColor: '#232426',
                    boxShadow: '0px 4px 4px 0px #00000040',
                    border: '1px solid #7F8CAA',
                    borderRadius: '40px'
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Spacing for Fixed Navigation */}
        <div className="h-15"></div>

        {/* Bottom Navigation */}
      </div>
    </div>
  );
}
