import React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, RefreshCw } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  useCount: number;
  lastUsed: Date;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  useCount = 0,
  lastUsed = new Date(),
}) => {
  return (
    <motion.div
      className="card h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="relative h-48 -mx-6 -mt-6 mb-4 rounded-t-lg overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-900/70 to-transparent p-4">
          <div className="flex justify-between items-center">
            <div className="bg-white dark:bg-neutral-900 rounded-full px-2 py-1 text-xs font-semibold flex items-center shadow-sm">
              <span className="text-yellow-500 mr-1">★</span> {product.rating}
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-full px-2 py-1 text-xs font-semibold flex items-center shadow-sm">
              ${product.price}
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg leading-tight">{product.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">{product.brand}</p>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400 flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" /> Uses
            </span>
            <span className="font-medium">{useCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600 dark:text-neutral-400 flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Last Used
            </span>
            <span className="font-medium">
              {lastUsed.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-4">
          {product.benefitsFor.map(benefit => (
            <span key={benefit} className="badge badge-secondary text-xs">
              {benefit === 'dark-spots' ? 'Dark Spots' : 
                benefit.charAt(0).toUpperCase() + benefit.slice(1).replace('-', ' ')}
            </span>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between">
          <button className="btn btn-ghost text-sm">Order Again</button>
          <button className="btn btn-outline text-sm">Review</button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;