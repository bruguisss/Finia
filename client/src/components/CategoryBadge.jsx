import React from 'react';

export const CATEGORY_COLORS = {
  'Alimentación': '#f59e0b',
  'Transporte': '#60a5fa',
  'Ocio': '#a78bfa',
  'Salud': '#34d399',
  'Hogar': '#fb923c',
  'Compras': '#f472b6',
  'Viajes': '#22d3ee',
  'Servicios': '#94a3b8',
  'Transferencias': '#a3e635',
  'Ingresos': '#6ee7b7',
  'Sin categoría': '#4b5563',
};

export const CATEGORY_EMOJIS = {
  'Alimentación': '🍽️',
  'Transporte': '🚗',
  'Ocio': '🎮',
  'Salud': '💊',
  'Hogar': '🏠',
  'Compras': '🛍️',
  'Viajes': '✈️',
  'Servicios': '⚙️',
  'Transferencias': '↔️',
  'Ingresos': '💰',
  'Sin categoría': '❓',
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] || '#4b5563';
  const emoji = CATEGORY_EMOJIS[category] || '❓';

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {emoji} {category}
    </span>
  );
}
