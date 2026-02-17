import { useMemo } from "react";

const CARNIVAL_COLORS = [
  "hsl(349 80% 58%)",
  "hsl(45 100% 55%)",
  "hsl(140 70% 45%)",
  "hsl(210 90% 55%)",
  "hsl(280 80% 60%)",
  "hsl(25 100% 55%)",
];

const CarnivalConfetti = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CARNIVAL_COLORS[Math.floor(Math.random() * CARNIVAL_COLORS.length)],
        delay: Math.random() * 5,
        duration: 3 + Math.random() * 4,
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <>
      {pieces.map((c) => (
        <div
          key={c.id}
          className="carnival-confetti"
          style={{
            left: `${c.left}%`,
            backgroundColor: c.color,
            width: c.size,
            height: c.size,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}
    </>
  );
};

export default CarnivalConfetti;
