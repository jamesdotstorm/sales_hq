'use client';

interface Props { dark: boolean }

export default function LeadsView({ dark }: Props) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div>
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>🎯 Targets</h1>
      </div>
    </div>
  );
}
