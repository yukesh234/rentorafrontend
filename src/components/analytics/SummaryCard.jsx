export default function SummaryCard({ icon: Icon, label, value, sublabel, tone = 'default', delta }) {
  const toneStyles = {
    default: 'text-[#D4A574]',
    danger: 'text-[#E07856]',
    success: 'text-green-400',
  };

  let deltaNode = null;
  if (delta === null) {
    deltaNode = <p className="mt-1 text-[11px] text-[#6B615A]">No earlier data to compare</p>;
  } else if (typeof delta === 'number') {
    const rounded = Math.round(delta);
    const up = rounded > 0;
    const flat = rounded === 0;
    deltaNode = (
      <p
        className={`mt-1 text-[11px] ${
          flat ? 'text-[#6B615A]' : up ? 'text-green-400' : 'text-[#E07856]'
        }`}
      >
        {flat ? '– no change' : `${up ? '▲' : '▼'} ${Math.abs(rounded)}%`}{' '}
        <span className="text-[#6B615A]">vs previous period</span>
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#2A2622] bg-[#211D1A] p-4">
      <div className="flex items-center gap-1.5 text-xs text-[#8A7F76]">
        <Icon size={13} />
        {label}
      </div>
      <p className={`mt-2 font-['Outfit'] text-2xl font-semibold ${toneStyles[tone]}`}>
        {value}
      </p>
      {sublabel && <p className="mt-0.5 text-xs text-[#6B615A]">{sublabel}</p>}
      {deltaNode}
    </div>
  );
}