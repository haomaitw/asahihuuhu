export type MenuItem = {
  id: string;
  nameKey: string;
  image?: string;
  badge?: 'seasonal' | 'new';
};

export type MenuCategory = {
  id: 'kakigori' | 'crepes' | 'drinks' | 'goods';
  labelKey: string;
  titleKey: string;
  anchorIcon: string;
  items: MenuItem[];
  addOns?: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: 'kakigori',
    labelKey: 'KAKIGORI',
    titleKey: 'lineup.kakigori.title',
    anchorIcon: '/asahi/anchor-shaved-ice.png',
    items: [
      { id: 'k-papaya', nameKey: 'menu.kakigori.papaya', image: '/asahi/product-papaya-milk.png', badge: 'seasonal' },
      { id: 'k-apple', nameKey: 'menu.kakigori.apple', image: '/asahi/product-cinnamon-apple-crepe.png', badge: 'seasonal' },
      { id: 'k-espuma', nameKey: 'menu.kakigori.espuma', image: '/asahi/ice-3.png' },
      { id: 'k-tiramisu', nameKey: 'menu.kakigori.tiramisu', image: '/asahi/product-tiramisu.png' },
      { id: 'k-blueberry', nameKey: 'menu.kakigori.blueberry', image: '/asahi/ice-5.png' },
      { id: 'k-okinawa', nameKey: 'menu.kakigori.okinawa', image: '/asahi/ice-6.png' },
    ],
    addOns: [
      { id: 'a-shiratama', nameKey: 'menu.addon.shiratama', image: '/asahi/option-shiratama.png' },
      { id: 'a-condensed', nameKey: 'menu.addon.condensed', image: '/asahi/option-condensed-milk.png' },
      { id: 'a-mascarpone', nameKey: 'menu.addon.mascarpone', image: '/asahi/option-mascarpone.png' },
    ],
  },
  {
    id: 'crepes',
    labelKey: 'CREPES',
    titleKey: 'lineup.crepes.title',
    anchorIcon: '/asahi/anchor-crepes.png',
    items: [
      { id: 'c-plain', nameKey: 'menu.crepes.plain', image: '/asahi/crepe-1.png' },
      { id: 'c-cinnamon', nameKey: 'menu.crepes.cinnamon', image: '/asahi/crepe-2.png' },
      { id: 'c-tiramisu', nameKey: 'menu.crepes.tiramisu', image: '/asahi/crepe-3.png' },
      { id: 'c-strawberry-honey', nameKey: 'menu.crepes.strawberryHoney', image: '/asahi/crepe-4.png' },
      { id: 'c-muscat', nameKey: 'menu.crepes.muscat', image: '/asahi/crepe-5.png' },
      { id: 'c-berry-brulee', nameKey: 'menu.crepes.berryBrulee', image: '/asahi/product-berry-brulee-crepe.png' },
      { id: 'c-white-strawberry', nameKey: 'menu.crepes.whiteStrawberry', image: '/asahi/crepe-6.png' },
      { id: 'c-caramel-coffee', nameKey: 'menu.crepes.caramelCoffee', image: '/asahi/crepe-7.png' },
      { id: 'c-cinnamon-apple', nameKey: 'menu.crepes.cinnamonApple', image: '/asahi/product-cinnamon-apple-crepe.png' },
    ],
  },
  {
    id: 'drinks',
    labelKey: 'DRINKS',
    titleKey: 'lineup.drinks.title',
    anchorIcon: '/asahi/anchor-drinks.png',
    items: [
      { id: 'd-mixed-berry', nameKey: 'menu.drinks.mixedBerry', image: '/asahi/drink-1.png' },
      { id: 'd-grapefruit', nameKey: 'menu.drinks.grapefruit', image: '/asahi/drink-2.png' },
      { id: 'd-vinegar', nameKey: 'menu.drinks.vinegar', image: '/asahi/drink-3.png' },
      { id: 'd-hot-tea', nameKey: 'menu.drinks.hotTea', image: '/asahi/drink-4.png' },
      { id: 'd-barley-tea', nameKey: 'menu.drinks.barleyTea', image: '/asahi/drink-5.png' },
    ],
  },
  {
    id: 'goods',
    labelKey: 'GOODS',
    titleKey: 'lineup.goods.title',
    anchorIcon: '/asahi/anchor-goods.svg',
    items: [
      { id: 'g-cup', nameKey: 'menu.goods.cup', image: '/asahi/goods-cup-single.png' },
    ],
  },
];
