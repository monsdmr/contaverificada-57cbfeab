import calendarImg from "@/assets/parabens-calendar.png";

interface CongratulationsCardProps {
  totalValue: string;
}

const CongratulationsCard = ({ totalValue }: CongratulationsCardProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            Parabéns!
          </h2>
          <h2 className="text-base font-bold text-gray-900 leading-tight">
            Você concluiu
          </h2>
          <h2 className="text-base font-bold text-gray-900 leading-tight mb-0.5">
            todas as tarefas
          </h2>
          <p className="text-lg font-bold text-primary tracking-tight">
            {totalValue}
          </p>
        </div>

        <div className="flex-shrink-0">
          <img
            src={calendarImg}
            alt="Calendário com check"
            className="h-24 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default CongratulationsCard;
