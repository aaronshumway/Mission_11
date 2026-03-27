interface CategoryFilterProps {
  categories: string[]
  selectedCategories: string[]
  onToggleCategory: (category: string) => void
  onClearCategories: () => void
}

export function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
}: CategoryFilterProps) {
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>Categories</span>
        <button
          type="button"
          className="btn btn-link btn-sm p-0"
          onClick={onClearCategories}
        >
          Clear
        </button>
      </div>
      <div className="card-body">
        {categories.map((category) => (
          <div key={category} className="form-check mb-1">
            <input
              className="form-check-input"
              type="checkbox"
              id={`cat-${category}`}
              checked={selectedCategories.includes(category)}
              onChange={() => onToggleCategory(category)}
            />
            <label className="form-check-label" htmlFor={`cat-${category}`}>
              {category}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}
