import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TransitionStyle } from '../data/gamesCatalog';
import { CharacterCompanion, CharacterMood } from './CharacterCompanion';

export interface LevelTransitionData {
  visible: boolean;
  style: TransitionStyle;
  characterId: string;
  title: string;
  subtitle: string;
  stepLabel: string;
  accentHex: string;
  mood?: CharacterMood;
}

interface LevelTransitionOverlayProps {
  transition: LevelTransitionData | null;
}

export const LevelTransitionOverlay: React.FC<LevelTransitionOverlayProps> = ({ transition }) => {
  if (!transition) return null;

  const renderBackgroundPattern = () => {
    switch (transition.style) {
      case 'checkerboard':
        return (
          <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.35, delay: (i % 6) * 0.03 + Math.floor(i / 6) * 0.03 }}
                className={i % 2 === 0 ? 'bg-[#121622]' : 'bg-[#1A2033]'}
              />
            ))}
          </div>
        );

      case 'origami':
        return (
          <div className="absolute inset-0 overflow-hidden bg-[#10141B]">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 0, backgroundColor: '#16202A' }}
              className="absolute inset-y-0 left-0 w-1/2 border-r border-white/10"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ originX: 1, backgroundColor: '#131B24' }}
              className="absolute inset-y-0 right-0 w-1/2"
            />
          </div>
        );

      case 'speedlines':
        return (
          <div className="absolute inset-0 overflow-hidden bg-[#140E18]">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ x: i % 2 === 0 ? '-100%' : '100%' }}
                animate={{ x: '0%' }}
                exit={{ x: i % 2 === 0 ? '100%' : '-100%' }}
                transition={{ duration: 0.28, delay: i * 0.025, ease: 'easeOut' }}
                className="h-[12.5%] w-full border-b border-white/5"
                style={{
                  background: i % 2 === 0 ? 'rgba(251, 113, 133, 0.14)' : 'rgba(15, 17, 23, 0.96)',
                }}
              />
            ))}
          </div>
        );

      case 'typewriter':
        return (
          <div className="absolute inset-0 flex flex-col bg-[#16130E]">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.28, delay: i * 0.04 }}
                className="flex-1 border-b border-amber-500/10"
              />
            ))}
          </div>
        );

      case 'paint':
        return (
          <div className="absolute inset-0 overflow-hidden bg-[#151221]">
            {['#A78BFA', '#FF5A36', '#10B981'].map((color, idx) => (
              <motion.div
                key={color}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0.22 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="absolute rounded-full blur-2xl"
                style={{
                  backgroundColor: color,
                  width: 320,
                  height: 320,
                  top: `${15 + idx * 18}%`,
                  left: `${20 + idx * 20}%`,
                }}
              />
            ))}
          </div>
        );

      case 'terminal':
        return (
          <div className="absolute inset-0 bg-[#0B1412] flex items-center justify-center">
            <motion.div
              initial={{ scaleY: 0.02, opacity: 0.4 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0.02, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full border-y-4"
              style={{ borderColor: transition.accentHex }}
            />
          </div>
        );

      case 'banner':
        return (
          <div className="absolute inset-0 bg-[#17130B] flex items-stretch">
            <motion.div
              initial={{ y: '-100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.32 }}
              className="w-1/2 bg-[#1F190D] border-r border-amber-400/20"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: '0%' }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32 }}
              className="w-1/2 bg-[#18130B]"
            />
          </div>
        );

      case 'spotlight':
      default:
        return (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(100% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-[#141622]"
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {transition.visible && (
        <motion.div
          key={`${transition.stepLabel}-${transition.title}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none select-none"
          aria-live="polite"
        >
          {renderBackgroundPattern()}

          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.06, y: -20, opacity: 0 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col items-center text-center px-8 py-8 rounded-2xl bg-[#181B26]/95 border border-white/15 shadow-2xl max-w-md mx-4"
          >
            <div
              className="text-xs font-mono font-bold tracking-widest uppercase mb-3"
              style={{ color: transition.accentHex }}
            >
              {transition.stepLabel}
            </div>

            <CharacterCompanion
              characterId={transition.characterId}
              mood={transition.mood || 'levelup'}
              size={104}
            />

            <h2 className="mt-4 text-2xl sm:text-3xl font-display font-bold text-[#F4F2ED] tracking-tight">
              {transition.title}
            </h2>
            <p className="mt-1.5 text-sm text-[#A6ACCD]">{transition.subtitle}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
