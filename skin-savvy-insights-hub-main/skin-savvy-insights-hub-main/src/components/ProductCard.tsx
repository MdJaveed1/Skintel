import React from 'react';
import { ExternalLink, Star, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductRecommendation } from '@/services/api';

interface ProductCardProps {
  product: ProductRecommendation;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const handleProductClick = () => {
    if (product.url) {
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Brand Badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 font-medium">
          {product.brand}
        </Badge>
        
        {/* Category Badge */}
        <Badge variant="secondary" className="absolute top-3 right-3 bg-black/50 text-white border-none">
          {product.category}
        </Badge>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Product Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              {product.concern && (
                <Badge variant="outline" className="mt-2">
                  For {product.concern}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.5</span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <p className="text-muted-foreground text-sm line-clamp-3">
              {product.description}
            </p>
          )}

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-xl text-primary">
              {product.price}
            </span>
            <Button 
              onClick={handleProductClick}
              size="sm"
              className="ml-auto group-hover:shadow-glow transition-all duration-300 flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" />
              Buy Now
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;