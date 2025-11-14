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
}

/**
 * A full-width, touch-friendly segmented control that is a high-craft evolution
 * of the IconToggleGroup. It supports both an icon and a text label for clarity.
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onValueChange,
  id,
}: SegmentedControlProps<T>) => {
  // Radix's onValueChange can be empty if an item is deselected.
  // This handler ensures we only call the parent callback with a valid value.
  const handleValueChange = (newValue: T) => {
    if (newValue) {
      onValueChange(newValue);
    }
  };

  return (
    <ToggleGroup.Root
      type="single"
      className={styles.segmentedControl}
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