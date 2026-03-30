import { useRef } from "react";
import { useNavigate } from "react-router-dom";

import { GradientButton, GradientHomeButton } from "../components/Button";
import { StickyHeader } from "../components";

export default function PrivacyPolicy() {
  const contentRef = useRef(null);
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* Header */}
      <StickyHeader 
        title="Privacy Policy"
        subtitle="Ebovir Biotech | Last Updated: 2026.02.23"
      >
        <GradientHomeButton />
        <GradientButton onClick={handlePrint}> Download PDF</GradientButton>
      </StickyHeader>

      {/* Policy Content */}
      <div ref={contentRef} className="max-w-4xl mx-auto px-6 py-12 space-y-10">

        {/* Summary */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <p>
            Ebovir Biotech (“Ebovir”, “we”, “us”, or “our”) is committed to
            protecting personal information in accordance with Quebec Law 25
            and other applicable Canadian privacy laws.
          </p>
        </section>

        {/* Scope */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Scope</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Website visitors</li>
            <li>Platform users (patients and clients)</li>
            <li>Name, date of birth, contact information</li>
            <li>Medical and genetic data (with explicit consent)</li>
            <li>Consultation details and uploaded documents</li>
            <li>Audio recordings (where consented)</li>
            <li>AI-generated outputs</li>
            <li>Usage logs and audit records</li>
          </ul>
        </section>

        {/* Purpose */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Purpose and Legal Basis
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Deliver AI-assisted medical/genetic services</li>
            <li>Generate structured analytical reports</li>
            <li>Maintain account security</li>
            <li>Comply with legal obligations</li>
            <li>Conduct consented research</li>
          </ul>
        </section>

        {/* AI Use */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Use of AI</h2>
          <p>
            Our services use artificial intelligence systems to analyze medical
            and genetic information and generate structured outputs.
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>AI outputs are not medical diagnoses</li>
            <li>Do not replace licensed healthcare professionals</li>
            <li>Users may request access to AI-generated information</li>
          </ul>
        </section>

        {/* Third Party */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Third-Party Service Providers
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Google Cloud Platform</li>
            <li>MongoDB Atlas</li>
            <li>SendGrid</li>
          </ul>
          <p className="mt-3">
            Cross-border transfers are assessed in accordance with Quebec Law 25.
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Data Retention & Safeguards
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encryption in transit (TLS)</li>
            <li>Encryption at rest</li>
            <li>Role-based access controls</li>
            <li>Audit logging</li>
          </ul>
        </section>

        {/* Individual Rights */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Individual Rights
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your information</li>
            <li>Request correction</li>
            <li>Request deletion</li>
            <li>Withdraw consent</li>
            <li>Request portability</li>
          </ul>
        </section>

        {/* Privacy Officer */}
        <section className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">
            Privacy Officer
          </h2>

          <p><strong>Name:</strong> Zhenlong Liu</p>
          <p><strong>Email:</strong> ebovirit@gmail.com</p>
          <p>
            <strong>Mailing Address:</strong><br />
            117-500, boulevard Cartier Ouest<br />
            Laval, Québec, Canada, H7V 5B7
          </p>
        </section>

        {/* Policy Updates */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Policy Updates
          </h2>
          <p>
            This policy may be updated periodically. Continued use of our
            services constitutes acceptance of the updated policy.
          </p>
        </section>

      </div>
    </div>
  );
}
