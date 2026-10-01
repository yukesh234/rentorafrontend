import { TrendingUp } from 'lucide-react';

export default function DemandForecastPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-[#3A3532] bg-[#1F1B18] p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2622]">
        <TrendingUp size={18} className="text-[#8A7F76]" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-[#F5F0EB]">Demand forecast</h3>
      <p className="mt-1 text-xs text-[#8A7F76]">
        Predictive demand insights are coming soon — this section will show expected booking
        volume for your listings based on historical patterns.
      </p>
    </div>
  );
}