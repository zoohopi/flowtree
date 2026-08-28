import { useState } from 'react';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export function PrinciplesPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 rounded-xl border border-line bg-card shadow-lg">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-xl px-4 py-2.5 text-sm font-medium text-ink"
      >
        <span>나만의 몰입 조건 · 원칙</span>
        <span className="text-muted">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={7}
            placeholder={'예)\n· 오전 9~11시가 가장 잘 됨\n· 폰은 다른 방에\n· 15분 워밍업 후 진입'}
            className="w-full resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none focus:border-accent"
          />
        </div>
      )}
    </div>
  );
}
