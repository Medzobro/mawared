import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { Store, Pill } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function ModeSelect() {
  const navigate = useNavigate();
  const setMode = useAppStore((s) => s.setMode);

  const handleSelect = (mode: 'shop' | 'pharmacy') => {
    setMode(mode);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      dir="rtl"
    >
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient bg-[var(--bg-primary)]" />

      <motion.div
        className="absolute rounded-full opacity-15"
        style={{
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
        }}
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-10"
        style={{
          width: 350,
          height: 350,
          background: 'radial-gradient(circle, rgba(15,118,110,0.35) 0%, transparent 70%)',
          bottom: '-10%',
          left: '-10%',
        }}
        animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-3xl px-4"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-3">
            اختر وضع عملك
          </h1>
          <p className="text-base text-[var(--text-muted)]">
            اختر البيئة التي تناسب عملك للوصول إلى الأدوات المخصصة
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Shop Mode */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('shop')}
            className="group text-right relative rounded-3xl p-8 sm:p-10 transition-all duration-300 cursor-pointer outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(32px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.3)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow:
                '0 24px 48px -12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Glow border on hover */}
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.15), transparent 50%, rgba(20,184,166,0.08))',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '1px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                className="w-20 h-20 mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(15,118,110,0.25))',
                  border: '1px solid rgba(20,184,166,0.15)',
                }}
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.6 }}
              >
                <Store className="w-10 h-10 text-teal-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                وضع المحل
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                إدارة المخزون، المبيعات، والفواتير لمحلك التجاري بكل سهولة
              </p>
            </div>
          </motion.button>

          {/* Pharmacy Mode */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('pharmacy')}
            className="group text-right relative rounded-3xl p-8 sm:p-10 transition-all duration-300 cursor-pointer outline-none"
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(32px) saturate(1.3)',
              WebkitBackdropFilter: 'blur(32px) saturate(1.3)',
              border: '1px solid rgba(255,255,255,0.06)',
              boxShadow:
                '0 24px 48px -12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.15), transparent 50%, rgba(20,184,166,0.08))',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                padding: '1px',
              }}
            />

            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div
                className="w-20 h-20 mb-6 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.2))',
                  border: '1px solid rgba(59,130,246,0.12)',
                }}
                whileHover={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.6 }}
              >
                <Pill className="w-10 h-10 text-blue-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                وضع الصيدلي
              </h2>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                إدارة الأدوية، الروشتات، والمخزون الصيدلاني باحترافية
              </p>
            </div>
          </motion.button>
        </div>

        {/* Footer hint */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs text-[var(--text-muted)] mt-10"
        >
          يمكنك تغيير الوضع لاحقاً من الإعدادات
        </motion.p>
      </motion.div>
    </div>
  );
}
