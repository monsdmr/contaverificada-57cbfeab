import checkIcon from "@/assets/check-icon.svg";
import coinIcon from "@/assets/coin-icon.svg";

interface CheckInDay {
  day: string;
  points: number;
  completed: boolean;
}

interface CheckInSectionProps {
  title: string;
  points: string;
  dateRange: string;
  days: CheckInDay[];
}

const CheckInSection = ({ title, points, dateRange, days }: CheckInSectionProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {title} <span className="text-primary">{points}</span>
          </p>
          <p className="text-xs text-primary mt-0.5">• {dateRange}</p>
        </div>
        <button className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400">
          Concluído
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-gray-500">
          Você concluiu todos os dias de check-in.
        </p>
      </div>

      <div className="flex justify-between gap-1.5">
        {days.map((day, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`relative w-11 h-11 rounded-xl flex flex-col items-center justify-center mb-1.5 ${
                day.completed ? "bg-red-50" : "bg-gray-100"
              }`}
            >
              <img
                src={coinIcon}
                alt=""
                className={`absolute h-5 w-5 opacity-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] ${
                  day.completed ? "" : "grayscale"
                }`}
              />
              {day.completed && (
                <img src={checkIcon} alt="Concluído" className="h-4 w-4 relative z-10" />
              )}
              <span className={`absolute bottom-0.5 text-[8px] font-semibold ${
                day.completed ? "text-primary/60" : "text-gray-400"
              }`}>
                {day.points}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-medium">{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckInSection;
