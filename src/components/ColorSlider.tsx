// src/components/ColorSlider.tsx
import { useId, useRef, useState, useCallback } from 'react';
import styles from './ColorSlider.module.css';

interface ColorSliderProps {
    value: number; // 0-360 (hue)
    onChange: (hue: number) => void;
    label: string;
    id?: string;
}

/**
 * ColorSlider Component (Custom Built)
 * 
 * A high-craft slider for selecting avatar color (hue).
 * Features:
 * - 4px tall OKLCH hue spectrum gradient track with 1px border
 * - Large draggable thumb (24px, primary surface)
 * - Live color swatch preview with 1px border
 */
export const ColorSlider = ({ value, onChange, label, id: providedId }: ColorSliderProps) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate thumb position percentage
    const thumbPosition = (value / 360) * 100;

    // Update value based on pointer position
    const updateValue = useCallback((clientX: number) => {
        if (!trackRef.current) return;

        const rect = trackRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newHue = Math.round(percentage * 360);

        onChange(newHue);
    }, [onChange]);

    // Mouse/Touch handlers on document for reliable dragging
    const handleStart = (clientX: number) => {
        setIsDragging(true);
        updateValue(clientX);

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
            updateValue(x);
        };

        const handleEnd = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove, { passive: true });
        document.addEventListener('touchend', handleEnd);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleStart(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        handleStart(e.touches[0].clientX);
    };

    // Keyboard support
    const handleKeyDown = (e: React.KeyboardEvent) => {
        let newValue = value;
        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                newValue = Math.min(360, value + 5);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                newValue = Math.max(0, value - 5);
                break;
            case 'Home':
                newValue = 0;
                break;
            case 'End':
                newValue = 360;
                break;
            default:
                return;
        }
        e.preventDefault();
        onChange(newValue);
    };

    // Generate OKLCH color for the swatch
    const swatchColor = `oklch(0.65 0.18 ${value})`;

    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>
            <div className={styles.controlRow}>
                <div
                    ref={trackRef}
                    className={styles.trackWrapper}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                >
                    <div className={styles.trackGradient} />
                    <div
                        className={styles.thumb}
                        style={{ left: `${thumbPosition}%` }}
                        role="slider"
                        aria-valuemin={0}
                        aria-valuemax={360}
                        aria-valuenow={value}
                        aria-label={label}
                        tabIndex={0}
                        onKeyDown={handleKeyDown}
                        data-dragging={isDragging}
                    />
                </div>
                <div
                    className={styles.swatch}
                    style={{ backgroundColor: swatchColor }}
                    aria-hidden="true"
                />
            </div>
        </div>
    );
};
