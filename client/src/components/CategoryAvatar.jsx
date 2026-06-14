import React from 'react';
import { useCategories, DEFAULT_COLOR, DEFAULT_EMOJI } from '../context/CategoriesContext.jsx';

export default function CategoryAvatar({ category, size = 36 }) {
  const { getCategory } = useCategories();
  const cat = getCategory(category);
  const color = cat?.color || DEFAULT_COLOR;
  const emoji = cat?.emoji || DEFAULT_EMOJI;

  return (
    <span
      className="flex items-center justify-center rounded-full shrink-0 text-base"
      style={{ width: size, height: size, backgroundColor: `${color}1a` }}
    >
      {emoji}
    </span>
  );
}
