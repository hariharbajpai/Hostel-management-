import React from 'react';
import { motion } from 'framer-motion';

const Select = ({ 
  label, 
  error, 
  options = [], 
  className = '', 
  containerClassName = '',
  ...props 
}) => {
  return (
    <motion.div 
      className={`flex flex-col gap-2 ${containerClassName}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="font-semibold text-sm text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`input-field ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.span 
          className="text-sm text-red-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  );
};

export default Select;
