interface FadedCircleProps {
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  className?: string;
  color?: string;
}

export default function FadedCircle({ top = '812px', left = '-11px', bottom, right, className, color = '#ffffff' }: FadedCircleProps) {
  return (
    <div
      className={`absolute ${className || ''}`}
      style={{
        // Make the circle responsive while capping at original size
        width: 'min(469px, 80vw)',
        height: 'min(457px, 80vw)',
        ...(bottom ? { bottom, right } : { top, left }),
        opacity: 0.8,
        background: `radial-gradient(circle, ${color}40 0%, ${color}10 50%, ${color}00 100%)`,
        backdropFilter: 'blur(100px)',
        borderRadius: '50%',
        transform: bottom ? 'translateY(50%)' : 'translateY(-50%)',
        zIndex: 0
      }}
    />
  );
}
