export default function SummaryCard({ icon: Icon, label, value, sublabel, tone = 'default' }) {
  const toneStyles = {
    default: 'text-[#D4A574]',
    danger: 'text-[#E07856]',
    success: 'text-green-400',
  };

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
    </div>
  );
}