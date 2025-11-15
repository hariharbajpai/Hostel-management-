import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'light', 
  className = '', 
  hoverable = true,
  ...props 
}) => {
  const variants = {
    light: 'bg-white border-2 border-gray-200 hover:border-gray-300',
    dark: 'bg-black text-white border-2 border-gray-800 hover:border-gray-700',
    glass: 'glass-effect',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverable ? { 
        y: -5, 
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        transition: { duration: 0.2 }
      } : {}}
      className={`rounded-xl p-6 transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
