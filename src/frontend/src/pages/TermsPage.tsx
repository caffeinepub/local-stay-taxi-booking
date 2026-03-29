export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: March 2026
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Stay Easy ("the Platform"), you agree to be
            bound by these Terms and Conditions. If you do not agree, please do
            not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            2. Booking Policy
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All bookings are subject to availability.</li>
            <li>
              An advance payment of <strong>20% of total amount</strong>{" "}
              (minimum ₹500) is required to confirm a booking.
            </li>
            <li>
              Bookings are confirmed only after advance payment is received and
              verified by the host.
            </li>
            <li>
              Stay Easy acts as a platform connecting guests with hosts and is
              not directly responsible for the property or services provided.
            </li>
          </ul>
        </section>

        <section className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            3. Cancellation &amp; Refund Policy
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li className="font-semibold text-red-700 dark:text-red-400">
              🚫 बुकिंग Amount Refundable नहीं होगा — Booking amount is strictly
              NON-REFUNDABLE.
            </li>
            <li>
              Once the advance payment is made, it will not be returned under
              any circumstances, including cancellation.
            </li>
            <li>
              In case of no-show or early checkout, no refund will be issued.
            </li>
            <li>
              The platform reserves the right to modify refund policies at any
              time.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            4. Payment
          </h2>
          <p>
            All payments are processed via UPI. Stay Easy is not responsible for
            any payment failures, delays, or disputes with the payment provider.
            Please keep proof of your payment for reference.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            5. User Responsibilities
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Users must provide accurate contact and booking information.
            </li>
            <li>
              Users are responsible for any damage caused to the property during
              their stay.
            </li>
            <li>
              Illegal activities on any listed property are strictly prohibited.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            6. Taxi Services
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Taxi bookings are subject to driver availability.</li>
            <li>
              Round trip prices are calculated as double the one-way fare.
            </li>
            <li>
              The platform is not liable for delays or accidents during transit.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            7. Restaurant &amp; Dhaba Bookings
          </h2>
          <p>
            Table reservations are subject to restaurant availability. Stay Easy
            is not responsible for food quality, service standards, or any
            disputes between guests and restaurant owners.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            8. Privacy
          </h2>
          <p>
            We collect only the information necessary to process your bookings
            (name, phone number). We do not share your personal data with third
            parties without your consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            9. Limitation of Liability
          </h2>
          <p>
            Stay Easy is a booking platform and is not liable for any loss,
            damage, injury, or inconvenience arising from services provided by
            listed hotels, restaurants, or taxi operators.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            10. Changes to Terms
          </h2>
          <p>
            We reserve the right to update these Terms at any time. Continued
            use of the platform after changes constitutes acceptance of the new
            terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            11. Contact
          </h2>
          <p>
            For any queries regarding these Terms, please contact us via the
            admin panel or reach out through the contact details listed on this
            platform.
          </p>
        </section>
      </div>
    </div>
  );
}
