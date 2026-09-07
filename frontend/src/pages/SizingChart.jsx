import StaticPage from './StaticPage'

const ABAYA_SIZES = [
  { size: 'XS', length: '138cm', chest: '86cm', sleeve: '57cm', shoulder: '37cm' },
  { size: 'S',  length: '141cm', chest: '90cm', sleeve: '58cm', shoulder: '38cm' },
  { size: 'M',  length: '144cm', chest: '96cm', sleeve: '59cm', shoulder: '40cm' },
  { size: 'L',  length: '147cm', chest: '102cm', sleeve: '60cm', shoulder: '42cm' },
  { size: 'XL', length: '150cm', chest: '108cm', sleeve: '61cm', shoulder: '44cm' },
  { size: 'XXL', length: '153cm', chest: '114cm', sleeve: '62cm', shoulder: '46cm' },
]

const THOBE_SIZES = [
  { size: 'S',   length: '140cm', chest: '102cm', sleeve: '60cm', collar: '37cm' },
  { size: 'M',   length: '143cm', chest: '108cm', sleeve: '61cm', collar: '38cm' },
  { size: 'L',   length: '146cm', chest: '114cm', sleeve: '62cm', collar: '40cm' },
  { size: 'XL',  length: '149cm', chest: '120cm', sleeve: '63cm', collar: '42cm' },
  { size: 'XXL', length: '152cm', chest: '126cm', sleeve: '64cm', collar: '44cm' },
]

function SizeTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-body border-collapse">
        <thead>
          <tr className="border-b border-iron">
            {headers.map((h) => (
              <th key={h} className="text-left py-3 pr-8 text-[11px] uppercase tracking-widest text-mist font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-iron/40 hover:bg-charcoal/50 transition-colors">
              {Object.values(row).map((val, j) => (
                <td key={j} className="py-3.5 pr-8 text-pearl">
                  {j === 0 ? <span className="text-ivory font-medium">{val}</span> : val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function SizingChart() {
  return (
    <StaticPage title="Sizing Chart" script="Find Your Fit">
      <p>
        All NUMME garments are designed for a graceful, relaxed fit that honours modesty
        and movement. Measurements below are garment measurements, not body measurements.
        When in doubt, size up.
      </p>

      <h2>Abaya Sizing</h2>
      <SizeTable
        headers={['Size', 'Length', 'Chest', 'Sleeve', 'Shoulder']}
        rows={ABAYA_SIZES}
      />

      <h2>Thobe Sizing</h2>
      <SizeTable
        headers={['Size', 'Length', 'Chest', 'Sleeve', 'Collar']}
        rows={THOBE_SIZES}
      />

      <h2>How to Measure</h2>
      <ul className="list-disc list-inside space-y-2 pl-2">
        <li><strong>Length</strong> — from highest point of shoulder to hem</li>
        <li><strong>Chest</strong> — across the widest part of the chest, doubled</li>
        <li><strong>Sleeve</strong> — from shoulder seam to cuff</li>
        <li><strong>Shoulder</strong> — from shoulder seam to shoulder seam</li>
        <li><strong>Collar</strong> — neck circumference at the base</li>
      </ul>

      <h2>Need Help?</h2>
      <p>
        Unsure of your size? Contact us at{' '}
        <a href="mailto:hello@numme.com" className="text-accent hover:underline">
          hello@numme.com
        </a>{' '}
        and our team will be happy to advise based on your measurements.
      </p>

      <p className="text-mist text-xs pt-8 border-t border-iron">
        Measurements are approximate and may vary by ±1–2cm due to the nature of handcrafted garments.
        Last updated: January 2025.
      </p>
    </StaticPage>
  )
}
