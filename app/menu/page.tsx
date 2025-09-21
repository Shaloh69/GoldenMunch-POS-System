"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { Badge } from '@heroui/badge';
import { Divider } from '@heroui/divider';
import { Image } from '@heroui/image';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

interface MenuCategory {
  name: string;
  icon: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ [key: number]: number }>({});

  // Mock data for demonstration while server is not ready
  const mockMenuData: MenuCategory[] = [
    {
      name: 'Cakes',
      icon: '🍰',
      items: [
        {
          id: 1,
          name: 'Chocolate Delight Cake',
          description: 'Rich chocolate cake with layers of creamy chocolate frosting',
          price: 24.99,
          image: '/api/placeholder/300/200',
          category: 'Cakes',
          isAvailable: true,
          isPopular: true
        },
        {
          id: 2,
          name: 'Vanilla Dream Cake',
          description: 'Classic vanilla sponge with vanilla buttercream',
          price: 22.99,
          image: '/api/placeholder/300/200',
          category: 'Cakes',
          isAvailable: true
        },
        {
          id: 3,
          name: 'Strawberry Bliss Cake',
          description: 'Fresh strawberry cake with whipped cream and real strawberries',
          price: 26.99,
          image: '/api/placeholder/300/200',
          category: 'Cakes',
          isAvailable: true,
          isPopular: true
        }
      ]
    },
    {
      name: 'Cupcakes',
      icon: '🧁',
      items: [
        {
          id: 4,
          name: 'Red Velvet Cupcake',
          description: 'Moist red velvet with cream cheese frosting',
          price: 4.99,
          image: '/api/placeholder/300/200',
          category: 'Cupcakes',
          isAvailable: true,
          isPopular: true
        },
        {
          id: 5,
          name: 'Lemon Zest Cupcake',
          description: 'Fresh lemon cupcake with tangy lemon glaze',
          price: 4.50,
          image: '/api/placeholder/300/200',
          category: 'Cupcakes',
          isAvailable: false
        },
        {
          id: 6,
          name: 'Chocolate Chip Cupcake',
          description: 'Vanilla cupcake loaded with chocolate chips',
          price: 4.75,
          image: '/api/placeholder/300/200',
          category: 'Cupcakes',
          isAvailable: true
        }
      ]
    },
    {
      name: 'Pastries',
      icon: '🥐',
      items: [
        {
          id: 7,
          name: 'Fresh Croissant',
          description: 'Buttery, flaky croissant baked fresh daily',
          price: 3.99,
          image: '/api/placeholder/300/200',
          category: 'Pastries',
          isAvailable: true
        },
        {
          id: 8,
          name: 'Danish Pastry',
          description: 'Sweet Danish with your choice of fruit topping',
          price: 4.25,
          image: '/api/placeholder/300/200',
          category: 'Pastries',
          isAvailable: true,
          isPopular: true
        }
      ]
    },
    {
      name: 'Cookies',
      icon: '🍪',
      items: [
        {
          id: 9,
          name: 'Chocolate Chip Cookie',
          description: 'Classic chocolate chip cookie, soft and chewy',
          price: 2.99,
          image: '/api/placeholder/300/200',
          category: 'Cookies',
          isAvailable: true,
          isPopular: true
        },
        {
          id: 10,
          name: 'Oatmeal Raisin Cookie',
          description: 'Hearty oatmeal cookie with plump raisins',
          price: 2.75,
          image: '/api/placeholder/300/200',
          category: 'Cookies',
          isAvailable: true
        }
      ]
    }
  ];

  // Simulate API call
  useEffect(() => {
    const fetchMenuData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // In a real app, this would be an actual API call
        // const response = await fetch('/api/menu');
        // const data = await response.json();
        
        // For now, use mock data
        setMenuData(mockMenuData);
      } catch (error) {
        console.error('Error fetching menu data:', error);
        setMenuData([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const categories = ['All', ...menuData.map(cat => cat.name)];

  const filteredItems = selectedCategory === 'All' 
    ? menuData.flatMap(cat => cat.items)
    : menuData.find(cat => cat.name === selectedCategory)?.items || [];

  const addToCart = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    let total = 0;
    Object.entries(cart).forEach(([itemId, count]) => {
      const item = menuData.flatMap(cat => cat.items).find(item => item.id === parseInt(itemId));
      if (item) {
        total += item.price * count;
      }
    });
    return total;
  };

  // Loading State
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: '#FFF8F0' }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🍰</div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: '#F9A03F' }}
          >
            Golden Munch
          </h1>
          <Spinner 
            size="lg" 
            color="warning"
            label="Loading delicious treats..."
            classNames={{
              label: "text-xl",
              circle1: "border-b-[#F9A03F]",
              circle2: "border-b-[#D97706]"
            }}
          />
          <p 
            className="mt-4 text-lg"
            style={{ color: '#4B2E2E' }}
          >
            Preparing your menu...
          </p>
        </div>
      </div>
    );
  }

  // No Data State
  if (!isLoading && menuData.length === 0) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center text-center px-8"
        style={{ backgroundColor: '#FFF8F0' }}
      >
        <div className="max-w-md">
          <div className="text-8xl mb-6">😔</div>
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ color: '#F9A03F' }}
          >
            Menu Temporarily Unavailable
          </h1>
          <p 
            className="text-xl mb-8"
            style={{ color: '#4B2E2E' }}
          >
            We're sorry, but our menu is currently being updated. Please try again in a few moments.
          </p>
          <div className="space-y-4">
            <Button
              size="lg"
              radius="full"
              style={{ 
                backgroundColor: '#F9A03F', 
                color: '#FFF8F0',
                fontWeight: 'bold'
              }}
              onPress={() => window.location.reload()}
            >
              🔄 Retry
            </Button>
            <Button
              size="lg"
              radius="full"
              variant="bordered"
              style={{ 
                borderColor: '#D97706', 
                color: '#D97706',
                fontWeight: 'bold'
              }}
              onPress={() => window.location.href = '/idle'}
            >
              🏠 Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-40 px-6 py-4 shadow-lg"
        style={{ backgroundColor: '#F9A03F' }}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#FFF8F0' }}>
              🍰 Golden Munch Menu
            </h1>
            <p className="text-lg opacity-90" style={{ color: '#FFF8F0' }}>
              Freshly baked, made with love
            </p>
          </div>
          
          {/* Cart Summary */}
          {getTotalItems() > 0 && (
            <Badge 
              content={getTotalItems()} 
              color="danger" 
              size="lg"
              classNames={{
                badge: "text-white font-bold"
              }}
            >
              <Button
                size="lg"
                radius="full"
                style={{ 
                  backgroundColor: '#4B2E2E', 
                  color: '#FFF8F0',
                  fontWeight: 'bold'
                }}
                onPress={() => alert(`Cart Total: $${getTotalPrice().toFixed(2)}\n\nItems:\n${Object.entries(cart).map(([itemId, count]) => {
                  const item = menuData.flatMap(cat => cat.items).find(item => item.id === parseInt(itemId));
                  return item ? `${item.name} x${count} - $${(item.price * count).toFixed(2)}` : '';
                }).filter(Boolean).join('\n')}`)}
              >
                🛒 View Cart - ${getTotalPrice().toFixed(2)}
              </Button>
            </Badge>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div 
        className="sticky top-20 z-30 px-6 py-4 shadow-md"
        style={{ backgroundColor: '#E6C89C' }}
      >
        <div className="flex space-x-2 overflow-x-auto max-w-7xl mx-auto">
          {categories.map((category) => (
            <Button
              key={category}
              size="md"
              radius="full"
              variant={selectedCategory === category ? 'solid' : 'bordered'}
              style={selectedCategory === category ? {
                backgroundColor: '#D97706',
                color: '#FFF8F0',
                borderColor: '#D97706'
              } : {
                borderColor: '#D97706',
                color: '#D97706',
                backgroundColor: 'transparent'
              }}
              onPress={() => setSelectedCategory(category)}
              className="whitespace-nowrap font-semibold"
            >
              {category === 'All' ? '🍽️' : menuData.find(cat => cat.name === category)?.icon} {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 
              className="text-2xl font-bold mb-2"
              style={{ color: '#4B2E2E' }}
            >
              No items in this category
            </h3>
            <p 
              className="text-lg"
              style={{ color: '#4B2E2E', opacity: 0.7 }}
            >
              Try selecting a different category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-bold"
                        style={{ color: '#4B2E2E' }}
                      >
                        {item.name}
                      </h3>
                      {item.isPopular && (
                        <Badge 
                          color="warning" 
                          variant="flat" 
                          size="sm"
                          className="mt-1"
                        >
                          🔥 Popular
                        </Badge>
                      )}
                    </div>
                    <div 
                      className="text-2xl font-bold"
                      style={{ color: '#F9A03F' }}
                    >
                      ${item.price}
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="pt-0">
                  <div className="mb-4">
                    <Image
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTZDODlDIi8+CiAgICA8dGV4dCB4PSIxNTAiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjQwIj7wn46yPC90ZXh0PgogICAgPHRleHQgeD0iMTUwIiB5PSIxMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM0QjJFMkUiPkRlbGljaW91cyBUcmVhdDwvdGV4dD4KPC9zdmc+"
                      alt={item.name}
                      width={300}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  
                  <p 
                    className="text-sm mb-4"
                    style={{ color: '#4B2E2E', opacity: 0.8 }}
                  >
                    {item.description}
                  </p>

                  <Divider className="my-4" />

                  {!item.isAvailable ? (
                    <Button
                      size="lg"
                      radius="full"
                      disabled
                      className="w-full font-bold"
                      style={{ 
                        backgroundColor: '#e0e0e0', 
                        color: '#888888'
                      }}
                    >
                      Currently Unavailable
                    </Button>
                  ) : cart[item.id] > 0 ? (
                    <div className="flex items-center justify-between">
                      <Button
                        size="md"
                        radius="full"
                        variant="bordered"
                        style={{ 
                          borderColor: '#D97706', 
                          color: '#D97706'
                        }}
                        onPress={() => removeFromCart(item.id)}
                      >
                        ➖
                      </Button>
                      <span 
                        className="text-xl font-bold px-4"
                        style={{ color: '#4B2E2E' }}
                      >
                        {cart[item.id]}
                      </span>
                      <Button
                        size="md"
                        radius="full"
                        style={{ 
                          backgroundColor: '#D97706', 
                          color: '#FFF8F0'
                        }}
                        onPress={() => addToCart(item.id)}
                      >
                        ➕
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      radius="full"
                      className="w-full font-bold"
                      style={{ 
                        backgroundColor: '#F9A03F', 
                        color: '#FFF8F0'
                      }}
                      onPress={() => addToCart(item.id)}
                    >
                      🛒 Add to Cart
                    </Button>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Back Button */}
      <Button
        size="lg"
        radius="full"
        className="fixed bottom-6 left-6 shadow-lg font-bold"
        style={{ 
          backgroundColor: '#4B2E2E', 
          color: '#FFF8F0'
        }}
        onPress={() => window.location.href = '/idle'}
      >
        🏠 Back to Home
      </Button>
    </div>
  );
}