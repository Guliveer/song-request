'use client';;
import { cn } from '@/lib/utils';
import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span'
}) {
  const MotionComponent = motion.create(as);

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
