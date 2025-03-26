import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function PrivacyPolicyContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild className="text-muted-foreground hover:text-foreground">
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">Last Updated: March 22, 2025</p>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p>
              Welcome to Listd. We respect your privacy and are committed to protecting your
              personal data. This privacy policy will inform you about how we look after your
              personal data when you visit our website and tell you about your privacy rights and
              how the law protects you.
            </p>
            <p>
              This privacy policy applies to all information collected through our website, as well
              as any related services, sales, marketing, or events.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register
              on our website, express an interest in obtaining information about us or our products
              and services, participate in activities on the website, or otherwise contact us.
            </p>
            <p>
              The personal information that we collect depends on the context of your interactions
              with us and the website, the choices you make, and the products and features you use.
              The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>Personal identifiers (name, email address, phone number)</li>
              <li>Credentials (passwords, account preferences)</li>
              <li>Payment information (credit card details, billing address)</li>
              <li>Location data (property addresses, search preferences)</li>
              <li>Usage data (how you interact with our website)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <p>
              We use personal information collected via our website for a variety of business
              purposes described below:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>To facilitate account creation and authentication</li>
              <li>To provide the services and features you request</li>
              <li>To match you with properties that meet your criteria</li>
              <li>To connect buyers, sellers, and renters</li>
              <li>To improve our website and user experience</li>
              <li>To respond to user inquiries and offer support</li>
              <li>To send administrative information and updates</li>
              <li>To send marketing and promotional communications (with your consent)</li>
              <li>To comply with legal obligations</li>
              <li>To enforce our terms, conditions, and policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
            <p>We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <strong>With Service Providers:</strong> We may share your information with service
                providers to help us provide our services and operate our business.
              </li>
              <li>
                <strong>With Business Partners:</strong> We may share your information with our
                business partners to offer you certain products, services, or promotions.
              </li>
              <li>
                <strong>With Property Owners/Agents:</strong> When you express interest in a
                property, your contact information may be shared with the property owner or agent.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share your information for any other
                purpose disclosed by us when you provide your consent.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information where required
                by law or to protect our rights.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to collect and store information
              about your interactions with our website. Cookies are small data files that are placed
              on your computer or mobile device when you visit a website.
            </p>
            <p>
              We use both session cookies (which expire once you close your web browser) and
              persistent cookies (which stay on your device until you delete them). The cookies we
              use include:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <strong>Essential cookies:</strong> These cookies are required for the website to
                function and cannot be switched off.
              </li>
              <li>
                <strong>Preference cookies:</strong> These cookies enable the website to remember
                choices you make and provide enhanced features.
              </li>
              <li>
                <strong>Analytics cookies:</strong> These cookies help us understand how visitors
                interact with our website.
              </li>
              <li>
                <strong>Marketing cookies:</strong> These cookies are used to track visitors across
                websites to display relevant advertisements.
              </li>
            </ul>
            <p>
              You can control and manage cookies in various ways. Please keep in mind that removing
              or blocking cookies can impact your user experience and parts of our website might not
              function correctly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures
              designed to protect the security of any personal information we process. However,
              despite our safeguards and efforts to secure your information, no electronic
              transmission over the Internet or information storage technology can be guaranteed to
              be 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Data Protection Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal
              data:
            </p>
            <ul className="list-disc pl-6 my-4">
              <li>
                <strong>Right to Access:</strong> You have the right to request copies of your
                personal information.
              </li>
              <li>
                <strong>Right to Rectification:</strong> You have the right to request that we
                correct any information you believe is inaccurate or complete information you
                believe is incomplete.
              </li>
              <li>
                <strong>Right to Erasure:</strong> You have the right to request that we erase your
                personal information, under certain conditions.
              </li>
              <li>
                <strong>Right to Restrict Processing:</strong> You have the right to request that we
                restrict the processing of your personal information, under certain conditions.
              </li>
              <li>
                <strong>Right to Object to Processing:</strong> You have the right to object to our
                processing of your personal information, under certain conditions.
              </li>
              <li>
                <strong>Right to Data Portability:</strong> You have the right to request that we
                transfer the data we have collected to another organization, or directly to you,
                under certain conditions.
              </li>
            </ul>
            <p>
              If you make a request, we have one month to respond to you. If you would like to
              exercise any of these rights, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p>
              Our website is not intended for children under the age of 18. We do not knowingly
              collect personal information from children under 18. If you become aware that a child
              has provided us with personal information, please contact us. If we become aware that
              we have collected personal information from a child under 18 without verification of
              parental consent, we will take steps to remove that information from our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes
              by posting the new privacy policy on this page and updating the "Last Updated" date.
              You are advised to review this privacy policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices, please
              contact us at:
            </p>
            <div className="mt-4">
              <p>
                <strong>Listd Inc.</strong>
              </p>
              <p>Email: privacy@listd.com</p>
              <p>Phone: +1 (123) 456-7890</p>
              <p>Address: 123 Real Estate Avenue, San Francisco, CA 94107</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
