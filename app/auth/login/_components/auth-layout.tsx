'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OptimizedBackground } from './optimized-background';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

const rotatingWords = [
  'freelancers',
  'agencies',
  'consultants',
  'creators',
  'teams',
  'companies',
  'everyone',
];

const TEXT_DELAY_MS = 400;
const IMAGE_DELAY_MS = 800;
const WORD_DELAY_AFTER_IMAGE_MS = 600;
const WORD_DISPLAY_DURATION_MS = 1800;
const FINAL_WORD = 'everyone';

export function AuthLayout({ children }: AuthLayoutProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [displayWord, setDisplayWord] = useState(rotatingWords[0]);
  const [isFading, setIsFading] = useState(false);
  const [hasWordAppeared, setHasWordAppeared] = useState(false);

  useEffect(() => {
    const wordDelay = IMAGE_DELAY_MS + WORD_DELAY_AFTER_IMAGE_MS;

    const timer = setTimeout(() => {
      setHasWordAppeared(true);
    }, wordDelay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasWordAppeared || !isAnimating) return;

    let interval: NodeJS.Timeout;
    let initialTimer: NodeJS.Timeout;

    initialTimer = setTimeout(() => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentWordIndex((prev) => {
          const nextIndex = prev + 1;
          const nextWord = rotatingWords[nextIndex];

          if (nextWord === FINAL_WORD) {
            setIsAnimating(false);
            setDisplayWord(nextWord);
            setIsFading(false);
            return nextIndex;
          }

          setDisplayWord(nextWord);
          setIsFading(false);
          return nextIndex;
        });

        interval = setInterval(() => {
          setIsFading(true);

          setTimeout(() => {
            setCurrentWordIndex((prev) => {
              const nextIndex = prev + 1;
              const nextWord = rotatingWords[nextIndex];

              if (nextWord === FINAL_WORD) {
                setIsAnimating(false);
                setDisplayWord(nextWord);
                setIsFading(false);
                return nextIndex;
              }

              setDisplayWord(nextWord);
              setIsFading(false);
              return nextIndex;
            });
          }, 300);
        }, WORD_DISPLAY_DURATION_MS);
      }, 300);
    }, WORD_DISPLAY_DURATION_MS);

    return () => {
      clearTimeout(initialTimer);
      if (interval) clearInterval(interval);
    };
  }, [isAnimating, hasWordAppeared]);

  return (
    <OptimizedBackground>
      <div className="w-full min-h-screen lg:h-screen flex flex-col lg:flex-row overflow-hidden lg:pr-16">
        <div className="w-full lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2000px] mx-auto flex flex-col lg:flex-row lg:gap-20 lg:h-full lg:items-center lg:justify-center lg:mr-30">
          <motion.div
            className="w-full lg:w-fit flex items-center justify-center lg:justify-end p-4 sm:p-6 md:p-8 lg:h-full "
            initial={{ opacity: 0, x: -50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full">{children}</div>
          </motion.div>

          <motion.div
            className="w-fit hidden lg:flex items-center justify-start lg:h-full"
            initial={{ opacity: 0, x: 50, y: -20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <div className="w-fit xl:max-w-2xl 2xl:max-w-3xl 3xl:max-w-4xl px-0 lg:h-full flex items-center">
              <div className="w-fit space-y-4 lg:space-y-5 xl:space-y-6 3xl:space-y-8 flex flex-col justify-center items-start">
                <motion.div
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                  className="w-fit"
                >
                  <Image
                    src="/logo.svg"
                    alt="Koopay Logo"
                    width={174}
                    height={48}
                    className="w-auto h-auto max-w-[140px] lg:max-w-[160px] xl:max-w-[174px] 3xl:max-w-[200px]"
                    priority
                  />
                </motion.div>

                <motion.div
                  className="w-fit space-y-1 lg:space-y-2 3xl:space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: TEXT_DELAY_MS / 1000 }}
                >
                  <h1>
                    <span className="text-2xl w-fit sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold text-white leading-tight text-left">
                      Secure payments for{' '}
                    </span>
                    <br />
                    <motion.span
                      key={displayWord}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: hasWordAppeared && !isFading ? 1 : 0,
                        y: hasWordAppeared && !isFading ? 0 : 10,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="text-2xl w-fit sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl 2xl:text-6xl 3xl:text-7xl font-bold text-white leading-tight text-left"
                    >
                      {displayWord}
                    </motion.span>
                  </h1>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                    delay: IMAGE_DELAY_MS / 1000,
                  }}
                  className="w-full flex-shrink-0"
                >
                  <Image
                    src="/login-illustration.png"
                    alt="Login Illustration"
                    width={530}
                    height={300}
                    className="w-full h-auto max-w-[350px] lg:max-w-[400px] xl:max-w-[450px] 2xl:max-w-[500px] 3xl:max-w-[600px]"
                    priority
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </OptimizedBackground>
  );
}
