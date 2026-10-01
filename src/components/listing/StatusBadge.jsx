const STATUS_STYLES = {
  DRAFT: 'bg-[#3A3532] text-[#A89A8C] border-[#4A443F]',
  ACTIVE: 'bg-[#C2542D]/15 text-[#D4A574] border-[#C2542D]/40',
  INACTIVE: 'bg-[#3A3532] text-[#A89A8C] border-[#4A443F]',
  ARCHIVED: 'bg-[#2A2622] text-[#6B615A] border-[#3A3532]',
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  ACTIVE: 'Live',
  INACTIVE: 'Paused',
  ARCHIVED: 'Archived',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}