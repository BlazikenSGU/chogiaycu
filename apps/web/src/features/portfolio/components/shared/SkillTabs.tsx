interface Tab {
  id: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export default function SkillTabs({
  tabs,
  activeTab,
  onChange,
}: Props) {
  return (
    <div className="pf-muted flex flex-wrap
      gap-1 rounded-lg p-1">

      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-pressed={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-md px-3 py-2
            text-xs font-medium transition
            ${
              activeTab === tab.id
                ? 'bg-[var(--pf-card)] shadow-sm'
                : 'pf-text-muted'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}