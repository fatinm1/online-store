import StaticPage from './StaticPage'

export default function ShippingPolicy() {
  return (
    <StaticPage title="Shipping Policy" script="Delivery &amp; Shipping">
      <p>
        We ship worldwide from our fulfilment centre. All orders are carefully packaged to
        ensure your garments arrive in perfect condition.
      </p>

      <h2>Processing Time</h2>
      <p>
        Orders are processed within <strong>1–3 business days</strong> of payment confirmation.
        You will receive a shipping confirmation email with tracking details once your
        order has been dispatched.
      </p>

      <h2>Shipping Rates &amp; Estimated Delivery</h2>
      <p>
        Shipping rates are calculated at checkout based on your location and chosen service.
        Estimated delivery times are as follows:
      </p>
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li><strong>GCC Countries</strong> — 2–4 business days</li>
        <li><strong>United Kingdom &amp; Europe</strong> — 4–7 business days</li>
        <li><strong>North America</strong> — 6–10 business days</li>
        <li><strong>Rest of World</strong> — 7–14 business days</li>
      </ul>

      <h2>Free Shipping</h2>
      <p>
        We offer complimentary standard shipping on orders over <strong>$150 USD</strong>.
      </p>

      <h2>Customs &amp; Duties</h2>
      <p>
        International orders may be subject to import duties and taxes levied by the
        destination country. NUMME is not responsible for any additional charges. Please
        check with your local customs authority before placing an order.
      </p>

      <h2>Order Tracking</h2>
      <p>
        Once dispatched, you will receive a tracking number via email. Track your order
        directly through our courier's website.
      </p>

      <h2>Lost or Delayed Packages</h2>
      <p>
        If your order has not arrived within the estimated timeframe, please contact us at{' '}
        <a href="mailto:hello@numme.com" className="text-accent hover:underline">
          hello@numme.com
        </a>{' '}
        and we will investigate with the courier on your behalf.
      </p>

      <p className="text-mist text-xs pt-8 border-t border-iron">
        Last updated: January 2025.
      </p>
    </StaticPage>
  )
}
