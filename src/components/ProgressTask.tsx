import coinIcon from "@/assets/coin-icon.svg";

interface ProgressStep {
  label: string;
  points: string;
}

interface ProgressTaskProps {
  title: string;
  points: string;
  progress: string;
  badge: string;
  steps: ProgressStep[];
  description?: string;
  completed?: boolean;
}

const ProgressTask = ({
  title,
  points,
  progress,
  badge,
  steps,
  description,
  completed = true
}: ProgressTaskProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {title} <span className="text-primary">{points}</span>
          </p>
          <p className="text-xs text-primary mt-0.5">• {progress}</p>
        </div>
        <button className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
          {completed ? 'Concluído' : 'Fazer'}
        </button>
      </div>

      <div className="inline-block bg-gray-100 rounded-full px-2.5 py-1 mb-3">
        <span className="text-[10px] font-medium text-gray-700">{badge}</span>
      </div>

      <div className="relative mt-1.5">
        <div className="absolute top-2.5 left-0 right-0 h-0.5 bg-gray-200">
          <div className="h-full bg-primary" style={{ width: '100%' }} />
        </div>

        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <img src={coinIcon} alt="Moeda" className="h-5 w-5 mb-0.5 relative z-10 bg-white" />
              <span className="text-[10px] text-gray-500 mt-0.5">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {description && (
        <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default ProgressTask;
