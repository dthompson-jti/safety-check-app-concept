// src/components/SegmentedControl.tsx
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import styles from './SegmentedControl.module.css';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: string; // Icon is now optional
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T | '';
  onValueChange: (value: T) => void;
  id: string;
  /** PRD-07: Layout mode - 'row' for horizontal, 'column' for vertical, 'grid' for 2-col */
  layout?: 'row' | 'column' | 'grid';
  /** Item content direction - 'row' for icon+text horizontal, 'column' for icon above text */
  itemDirection?: 'row' | 'column';
}

/**
 * A full-width, touch-friendly segmented control that is a high-craft evolution
 * of the IconToggleGroup. It supports both an icon and a text label for clarity.
 * 
 * PRD-07: Supports 'row' (horizontal), 'column' (vertical), and 'grid' (2-col) layouts.
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onValueChange,
  id,
  layout = 'row',
  itemDirection = 'row',
}: SegmentedControlProps<T>) => {
  // Radix's onValueChange can be empty if an item is deselected.
  // This handler ensures we only call the parent callback with a valid value.
  const handleValueChange = (newValue: T) => {
    if (newValue) {
      onValueChange(newValue);
    }
  };

  // Determine container class based on layout
  let containerClass = styles.segmentedControl; // default: row (horizontal)
  if (layout === 'column') {
    containerClass = styles.columnContainer;
  } else if (layout === 'grid') {
    containerClass = styles.gridContainer;
  }

  // Determine item class based on itemDirection
  const itemClass = itemDirection === 'column'
    ? `${styles.segmentedControlItem} ${styles.itemColumn}`
    : styles.segmentedControlItem;

  // PRD-07: Calculate if we need a dead cell for grid layout (odd number of items)
  const needsDeadCell = layout === 'grid' && options.length % 2 !== 0;

  return (
    <ToggleGroup.Root
      type="single"
      className={containerClass}
      value={value}
      onValueChange={handleValueChange}
      aria-label={id}
      id={id}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={itemClass}
        >
          {option.icon && <span className="material-symbols-rounded">{option.icon}</span>}
          <span>{option.label}</span>
        </ToggleGroup.Item>
      ))}
      {/* PRD-07: Dead cell for grid layout with odd number of options */}
      {needsDeadCell && <div className={styles.deadCell} aria-hidden="true" />}
    </ToggleGroup.Root>
  );
};