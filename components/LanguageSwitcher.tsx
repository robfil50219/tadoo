'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { menuVariants, subtleButtonTap } from '@/lib/animations';
import { useLanguage } from '@/lib/hooks/useLanguage';
import './LanguageSwitcher.scss';

interface LanguageSwitcherProps {
  className?: string;
  menuPlacement?: 'top' | 'bottom';
}

export default function LanguageSwitcher({
  className = '',
  menuPlacement = 'top',
}: LanguageSwitcherProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { language, languageOptions, setLanguage, t } = useLanguage();
  const selectedLanguage = languageOptions.find((option) => option.value === language) || languageOptions[0];

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const classes = [
    'language-switcher',
    `language-switcher--${menuPlacement}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={menuRef}>
      <motion.button
        type="button"
        className="language-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={t('language.current', { language: selectedLanguage.label })}
        title={t('language.choose')}
        whileTap={subtleButtonTap(shouldReduceMotion)}
      >
        <span className="flag" aria-hidden="true">{selectedLanguage.flag}</span>
        <span>{selectedLanguage.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="language-options"
            role="menu"
            aria-label={t('language.choose')}
            variants={menuVariants(shouldReduceMotion)}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {languageOptions.map((option) => (
              <motion.button
                key={option.value}
                type="button"
                className={language === option.value ? 'active' : undefined}
                onClick={() => {
                  setLanguage(option.value);
                  setIsOpen(false);
                }}
                role="menuitemradio"
                aria-checked={language === option.value}
                whileTap={subtleButtonTap(shouldReduceMotion)}
              >
                <span className="flag" aria-hidden="true">{option.flag}</span>
                <span>{option.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
