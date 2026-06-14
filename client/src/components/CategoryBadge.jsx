import React from 'react';
import { useCategories, DEFAULT_COLOR, DEFAULT_EMOJI } from '../context/CategoriesContext.jsx';

export default function CategoryBadge({ category }) {
  const { getCategory } = useCategories();
  const cat = getCategory(category);
  const color = cat?.color || DEFAULT_COLOR;
  const emoji = cat?.emoji || DEFAULT_EMOJI;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: `${color}1a`, color }}
    >
      {emoji} {category}
    </span>
  );
}
