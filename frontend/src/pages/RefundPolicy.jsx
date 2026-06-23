import StaticPage from './StaticPage'

export default function RefundPolicy() {
  return (
    <StaticPage title="Refund Policy" script="Returns &amp; Refunds">
      <p>
        At NUMME, we stand behind every piece we make. If you are not completely satisfied
        with your purchase, we are here to help.
      </p>

      <h2>Eligibility</h2>
      <p>
        Items may be returned within <strong>14 days</strong> of delivery, provided they are
        unworn, unwashed, and in their original condition with all tags attached.
        Sale items and gift cards are not eligible for return.
      </p>

      <h2>How to Return</h2>
      <p>
        To initiate a return, please contact us at{' '}
        <a href="mailto:returns@numme.com" className="text-accent hover:underline">
          returns@numme.com
        </a>{' '}
        with your order number and reason for return. We will respond within 2 business
        days with return instructions.
      </p>

      <h2>Refunds</h2>
      <p>
        Once your return is received and inspected, we will notify you of the approval or
        rejection of your refund. Approved refunds are processed to your original payment
        method within <strong>5–10 business days</strong>. Shipping costs are non-refundable.
      </p>

      <h2>Exchanges</h2>
      <p>
        We currently do not offer direct exchanges. If you wish to exchange an item,
        please return the original and place a new order.
      </p>

      <h2>Damaged or Incorrect Items</h2>
      <p>
        If you receive a damaged or incorrect item, please contact us within 48 hours of
        delivery. We will arrange a replacement or full refund at no additional cost.
      </p>

      <p className="text-mist text-xs pt-8 border-t border-iron">
        Last updated: January 2025. This policy may be updated from time to time —
        please check this page before returning an item.
      </p>
    </StaticPage>
  )
}
