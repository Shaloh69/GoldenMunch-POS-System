"use client";

import { useState, useEffect } from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarBrand,
  NavbarItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Badge } from "@heroui/badge";
import NextLink from "next/link";
import clsx from "clsx";

export const KioskNavbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Idle detection
  useEffect(() => {
    const resetIdleTimer = () => {
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      const timer = setTimeout(() => {
        // Navigate to idle page after 30 seconds of inactivity
        window.location.href = '/idle';
      }, 30000);
      
      setIdleTimer(timer);
    };

    // Events that reset the idle timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Initialize timer
    resetIdleTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
    };
  }, [idleTimer]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <HeroUINavbar 
      maxWidth="full" 
      position="sticky"
      classNames={{
        base: "bg-golden-orange border-b-4 border-deep-amber shadow-lg",
        wrapper: "px-6",
      }}
    >
      {/* Left side - Logo and Title */}
      <NavbarContent className="basis-1/3" justify="start">
        <NavbarBrand as="div" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-2" href="/">
            <span className="text-4xl">🍰</span>
            <div>
              <p className="font-bold text-2xl text-chocolate-brown">Golden Munch</p>
              <p className="text-sm text-chocolate-brown/70">Touch Screen Ordering</p>
            </div>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* Center - Navigation Buttons */}
      <NavbarContent className="basis-1/3" justify="center">
        <div className="flex gap-4">
          <NavbarItem>
            <Button
              as={NextLink}
              href="/"
              size="lg"
              variant="ghost"
              className="text-chocolate-brown hover:bg-deep-amber/20 font-semibold text-lg px-6"
            >
              🏠 Home
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              as={NextLink}
              href="/categories"
              size="lg"
              variant="ghost"
              className="text-chocolate-brown hover:bg-deep-amber/20 font-semibold text-lg px-6"
            >
              📋 Categories
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Badge content="New!" color="danger" size="sm">
              <Button
                as={NextLink}
                href="/specials"
                size="lg"
                variant="ghost"
                className="text-chocolate-brown hover:bg-deep-amber/20 font-semibold text-lg px-6"
              >
                ⭐ Specials
              </Button>
            </Badge>
          </NavbarItem>
        </div>
      </NavbarContent>

      {/* Right side - Time and Help */}
      <NavbarContent className="basis-1/3" justify="end">
        <NavbarItem className="hidden sm:flex">
          <div className="text-right text-chocolate-brown">
            <div className="font-bold text-xl">{formatTime(currentTime)}</div>
            <div className="text-sm opacity-70">{formatDate(currentTime)}</div>
          </div>
        </NavbarItem>
        <NavbarItem>
          <Button
            size="lg"
            variant="solid"
            className="bg-deep-amber hover:bg-chocolate-brown text-cream-white font-bold px-6"
          >
            🆘 Help
          </Button>
        </NavbarItem>
      </NavbarContent>
    </HeroUINavbar>
  );
};