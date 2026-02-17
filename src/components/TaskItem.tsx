import coinIcon from "@/assets/coin-icon.svg";

interface TaskItemProps {
  title: string;
  points: string;
  progress?: string;
  badge?: string;
  completed?: boolean;
  progressSteps?: { points: string; active: boolean }[];
  description?: string;
}

const TaskItem = ({
  title,
  points,
  progress,
  badge,
  completed = true,
  progressSteps,
  description
}: TaskItemProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {title} <span className="text-primary">{points}</span>
          </p>
          {progress && (
            <p className="text-xs text-primary mt-0.5">• {progress}</p>
          )}
        </div>
        <button className="flex-shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
          {completed ? "Concluído" : "Fazer"}
        </button>
      </div>

      {badge && (
        <div className="inline-block bg-gray-100 rounded-full px-2.5 py-1 mb-2">
          <span className="text-[10px] font-medium text-gray-700">{badge}</span>
        </div>
      )}

      {progressSteps && (
        <div className="relative mt-2 pt-2">
          <div className="absolute top-5 left-6 right-6 border-t-2 border-dashed border-gray-300" />

          <div className="flex justify-between relative">
            {progressSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative z-10 bg-white p-0.5">
                  <img src={coinIcon} alt="Moeda" className="h-5 w-5" />
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5">{step.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {description && (
        <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default TaskItem;
