export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Golden Munch Kiosk",
  description: "Freshly baked goods and delicious treats, made with love.",
  navItems: [
    {
      label: "Home",
      href: "/idle",
    },
    {
      label: "Menu",
      href: "/menu",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Menu",
      href: "/menu",
    },
    {
      label: "Home",
      href: "/idle",
    },
    {
      label: "About",
      href: "/about",
    },
    {
      label: "Contact",
      href: "/contact",
    },
  ],
  links: {
    github: "https://github.com/golden-munch/kiosk",
    docs: "https://golden-munch.com/docs",
    contact: "mailto:hello@golden-munch.com",
  },
};