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
  /** PRD-02: Layout mode - 'row' for horizontal, 'grid' for 2x2 */
  layout?: 'row' | 'grid';
}

/**
 * A full-width, touch-friendly segmented control that is a high-craft evolution
 * of the IconToggleGroup. It supports both an icon and a text label for clarity.
 * 
 * PRD-02: Now supports a 'grid' layout for 4-option configurations (2x2 grid).
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onValueChange,
  id,
  layout = 'row',
}: SegmentedControlProps<T>) => {
  // Radix's onValueChange can be empty if an item is deselected.
  // This handler ensures we only call the parent callback with a valid value.
  const handleValueChange = (newValue: T) => {
    if (newValue) {
      onValueChange(newValue);
    }
  };

  // Determine container class based on layout
  const containerClass = layout === 'grid'
    ? styles.gridContainer
    : styles.segmentedControl;

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
          className={styles.segmentedControlItem}
        >
          {option.icon && <span className="material-symbols-rounded">{option.icon}</span>}
          <span>{option.label}</span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
};