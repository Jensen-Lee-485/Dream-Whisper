'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DreamPortalProps {
  onActivate: () => void;
}

// 生成星尘粒子数据
function generateParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 2,
    opacity: 0.2 + Math.random() * 0.5,
    duration: 15 + Math.random() * 25,
    delay: Math.random() * -30,
  }));
}

export default function DreamPortal({ onActivate }: DreamPortalProps) {
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([]);
  const [vortexParticles, setVortexParticles] = useState<{ id: number; angle: number; radius: number; size: number; speed: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 仅在客户端生成随机粒子，避免 SSR hydration 不匹配
  useEffect(() => {
    setParticles(generateParticles(80));
    setVortexParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        angle: (i / 40) * Math.PI * 2,
        radius: 80 + Math.random() * 160,
        size: 1 + Math.random() * 2,
        speed: 0.5 + Math.random() * 1.5,
      }))
    );
  }, []);

  const handleActivate = useCallback(() => {
    if (activated) return;
    setActivated(true);
    // 动画完成后触发回调
    setTimeout(() => onActivate(), 1400);
  }, [activated, onActivate]);

  // 涟漪环
  const [rings] = useState(() =>
    Array.from({ length: 3 }, (_, i) => ({
      id: i,
      delay: i * 1.2,
      duration: 3.6,
    }))
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[70vh] flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* ====== 星尘背景粒子 ====== */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              opacity: p.opacity,
            }}
            animate={
              activated
                ? {
                    x: `calc(50vw - ${p.x}vw)`,
                    y: `calc(35vh - ${p.y}vh)`,
                    opacity: 0,
                    scale: 0,
                  }
                : hovered
                  ? {
                      y: [0, -30, 0, 20, 0],
                      x: [0, 15, -10, 5, 0],
                      opacity: [p.opacity, p.opacity + 0.2, p.opacity],
                    }
                  : {
                      y: [0, -15, 0, 10, 0],
                      x: [0, 8, -5, 3, 0],
                    }
            }
            transition={
              activated
                ? { duration: 1.2, ease: 'easeIn', delay: (p.id % 10) * 0.04 }
                : {
                    duration: hovered ? p.duration * 0.5 : p.duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: p.delay,
                  }
            }
          />
        ))}
      </div>

      {/* ====== 梦境之眼 / 传送门 ====== */}
      <AnimatePresence>
        {!activated && (
          <motion.div
            className="relative z-10 cursor-pointer"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onClick={handleActivate}
            exit={{ scale: 8, opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 外层涟漪光环 */}
            {rings.map((ring) => (
              <motion.div
                key={ring.id}
                className="absolute inset-0 rounded-full border border-purple-500/20"
                style={{ margin: -20 - ring.id * 20 }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: ring.duration,
                  repeat: Infinity,
                  delay: ring.delay,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* 旋转光环 */}
            <motion.div
              className="absolute -inset-8 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, rgba(138,43,226,0.3), transparent, rgba(75,0,130,0.2), transparent)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />

            {/* 外层辉光 */}
            <motion.div
              className="absolute -inset-6 rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(138,43,226,0.3), transparent 70%)',
              }}
              animate={
                hovered
                  ? { scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }
                  : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }
              }
              transition={{
                duration: hovered ? 1.5 : 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* 核心眼球 */}
            <motion.div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 40% 40%, #8a2be2, #4b0082 60%, #1a0033)',
                boxShadow: '0 0 60px rgba(138,43,226,0.4), inset 0 0 40px rgba(138,43,226,0.3)',
              }}
              animate={
                hovered
                  ? { scale: 1.08, boxShadow: '0 0 80px rgba(138,43,226,0.7), inset 0 0 50px rgba(138,43,226,0.5)' }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* 内层漩涡 */}
              <motion.div
                className="absolute inset-3 rounded-full overflow-hidden"
                style={{
                  background:
                    'conic-gradient(from 0deg, #2d1066, #4b0082, #6b21a8, #3b0764, #2d1066)',
                }}
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              />

              {/* 中心亮点 */}
              <motion.div
                className="relative w-8 h-8 md:w-10 md:h-10 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #c084fc, #8a2be2 50%, transparent 80%)',
                  boxShadow: '0 0 20px rgba(192,132,252,0.8)',
                }}
                animate={
                  hovered
                    ? { scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }
                    : { scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }
                }
                transition={{
                  duration: hovered ? 1 : 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* 轨道粒子 */}
              {vortexParticles.slice(0, 12).map((vp) => (
                <motion.div
                  key={vp.id}
                  className="absolute w-1 h-1 rounded-full bg-purple-300/60"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [
                      Math.cos(vp.angle) * vp.radius * 0.35,
                      Math.cos(vp.angle + Math.PI) * vp.radius * 0.35,
                      Math.cos(vp.angle + Math.PI * 2) * vp.radius * 0.35,
                    ],
                    y: [
                      Math.sin(vp.angle) * vp.radius * 0.35,
                      Math.sin(vp.angle + Math.PI) * vp.radius * 0.35,
                      Math.sin(vp.angle + Math.PI * 2) * vp.radius * 0.35,
                    ],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4 / vp.speed,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== 点击后的漩涡吸入 ====== */}
      <AnimatePresence>
        {activated && (
          <motion.div
            className="absolute z-20 rounded-full"
            style={{
              background:
                'radial-gradient(circle, #8a2be2, #4b0082 40%, #0d0b26 70%)',
            }}
            initial={{ width: 160, height: 160, opacity: 1 }}
            animate={{
              width: '250vmax',
              height: '250vmax',
              opacity: [1, 1, 0.8],
            }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </AnimatePresence>

      {/* ====== 文字引导 ====== */}
      <AnimatePresence>
        {!activated && (
          <motion.div
            className="relative z-10 mt-12 md:mt-16 text-center pointer-events-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, transition: { duration: 0.4 } }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <h2
              className="text-2xl md:text-3xl font-light tracking-[0.2em] text-transparent bg-clip-text mb-4"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #e0c3fc, #c084fc, #8a2be2)',
              }}
            >
              潜入意识之海
            </h2>
            <p className="text-indigo-400/50 text-xs md:text-sm tracking-[0.3em] uppercase font-light">
              Touch to unveil your Dream Chart
            </p>
            <motion.p
              className="mt-6 text-indigo-300/40 text-xs tracking-widest"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              触碰，开启你的梦境星图
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
