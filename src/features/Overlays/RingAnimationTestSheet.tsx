// src/features/Overlays/RingAnimationTestSheet.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { WaapiRingVisualizer } from '../Shell/WaapiRingVisualizer';
import { RingAnimationParams, DEFAULT_RING_PARAMS } from '../Shell/useRingAnimation';
import { Button } from '../../components/Button';
import styles from './DeveloperModal.module.css';

interface RingAnimationTestSheetProps {
    onClose: () => void;
}

interface SliderConfig {
    key: keyof RingAnimationParams;
    label: string;
    min: number;
    max: number;
    step: number;
    unit?: string;
}

const SLIDER_CONFIGS: SliderConfig[] = [
    // Conveyor belt
    { key: 'ringCount', label: 'Ring Count', min: 5, max: 15, step: 1 },
    { key: 'conveyorDuration', label: 'Conveyor Duration', min: 20, max: 120, step: 5, unit: 's' },
    { key: 'baseOpacity', label: 'Base Opacity', min: 0.1, max: 0.6, step: 0.05 },
    { key: 'fadeInPercent', label: 'Fade In %', min: 0.05, max: 0.3, step: 0.05 },
    { key: 'fadeOutPercent', label: 'Fade Out %', min: 0.05, max: 0.3, step: 0.05 },
    { key: 'baseStrokeWidth', label: 'Base Stroke', min: 1, max: 4, step: 0.5, unit: 'px' },
    // Shimmer
    { key: 'shimmerPeriod', label: 'Shimmer Period', min: 2, max: 15, step: 0.5, unit: 's' },
    { key: 'shimmerDuration', label: 'Shimmer Duration', min: 0.5, max: 5, step: 0.25, unit: 's' },
    { key: 'shimmerOpacityBoost', label: 'Shimmer Opacity+', min: 0.1, max: 1.0, step: 0.05 },
    { key: 'shimmerStrokeBoost', label: 'Shimmer Stroke+', min: 0.5, max: 3, step: 0.25, unit: 'px' },
];

/**
 * "Fully In Sync" Recipes - Parameter combinations with perfect phase alignment
 * Key: shimmerPeriod should divide evenly into conveyorDuration for repeating patterns
 */
interface SyncRecipe {
    name: string;
    description: string;
    params: Partial<RingAnimationParams>;
}

const SYNC_RECIPES: SyncRecipe[] = [
    {
        name: 'Gentle Breath',
        description: '60s conveyor / 6s shimmer (10 cycles) - slow, meditative',
        params: {
            ringCount: 10,
            conveyorDuration: 60,
            shimmerPeriod: 6,
            shimmerDuration: 2,
            baseOpacity: 0.25,
            shimmerOpacityBoost: 0.4,
        },
    },
    {
        name: 'Heartbeat',
        description: '40s conveyor / 5s shimmer (8 cycles) - rhythmic pulse',
        params: {
            ringCount: 8,
            conveyorDuration: 40,
            shimmerPeriod: 5,
            shimmerDuration: 1.5,
            baseOpacity: 0.3,
            shimmerOpacityBoost: 0.5,
        },
    },
    {
        name: 'Radar Sweep',
        description: '30s conveyor / 3s shimmer (10 cycles) - quick, active',
        params: {
            ringCount: 10,
            conveyorDuration: 30,
            shimmerPeriod: 3,
            shimmerDuration: 1,
            baseOpacity: 0.2,
            shimmerOpacityBoost: 0.6,
            shimmerStrokeBoost: 2,
        },
    },
    {
        name: 'Ocean Tide',
        description: '90s conveyor / 9s shimmer (10 cycles) - very slow, calming',
        params: {
            ringCount: 12,
            conveyorDuration: 90,
            shimmerPeriod: 9,
            shimmerDuration: 3,
            baseOpacity: 0.2,
            fadeInPercent: 0.2,
            fadeOutPercent: 0.2,
            shimmerOpacityBoost: 0.35,
        },
    },
    {
        name: 'Perfect Sync',
        description: '50s conveyor / 5s shimmer (10 cycles) - 10 rings, each shimmer = 1 ring',
        params: {
            ringCount: 10,
            conveyorDuration: 50,
            shimmerPeriod: 5,
            shimmerDuration: 2,
            baseOpacity: 0.3,
            shimmerOpacityBoost: 0.5,
        },
    },
];

/**
 * Phase visualization component showing real-time phase alignment
 */
const PhaseVisualization: React.FC<{ params: RingAnimationParams; mountKey: number }> = ({ params, mountKey }) => {
    const [phases, setPhases] = useState<{ conveyor: number; shimmer: number }[]>([]);
    const mountTimeRef = useRef<number>(0);
    const shimmerStartRef = useRef<number>(0);

    useEffect(() => {
        mountTimeRef.current = performance.now();
        shimmerStartRef.current = performance.now();

        const updatePhases = () => {
            const now = performance.now();
            const elapsedSinceMount = (now - mountTimeRef.current) / 1000;
            const elapsedSinceShimmer = (now - shimmerStartRef.current) / 1000;

            // Check if shimmer should restart
            if (elapsedSinceShimmer >= params.shimmerPeriod) {
                shimmerStartRef.current = now;
            }

            const newPhases = Array.from({ length: params.ringCount }, (_, i) => {
                // Conveyor phase: each ring offset by (i / ringCount) of the cycle
                const conveyorOffset = (i / params.ringCount) * params.conveyorDuration;
                const conveyorPhase = ((elapsedSinceMount + conveyorOffset) % params.conveyorDuration) / params.conveyorDuration;

                // Shimmer phase: staggered delay per ring
                const shimmerDelay = (i / params.ringCount) * params.shimmerDuration;
                const timeSinceShimmerStart = (now - shimmerStartRef.current) / 1000;
                const shimmerProgress = Math.max(0, Math.min(1, (timeSinceShimmerStart - shimmerDelay) / 0.8));

                return {
                    conveyor: conveyorPhase,
                    shimmer: shimmerProgress < 1 && shimmerProgress > 0 ? shimmerProgress : 0,
                };
            });

            setPhases(newPhases);
        };

        const interval = setInterval(updatePhases, 100);
        updatePhases();

        return () => clearInterval(interval);
    }, [params, mountKey]);

    return (
        <div className={styles.phaseViz}>
            <div className={styles.phaseVizLabel}>Phase Alignment (Ring 0 = inner)</div>
            <div className={styles.phaseVizGrid}>
                {phases.map((phase, i) => (
                    <div key={i} className={styles.phaseVizRing}>
                        <span className={styles.phaseVizIndex}>{i}</span>
                        <div className={styles.phaseVizBar}>
                            <div
                                className={styles.phaseVizConveyor}
                                style={{ width: `${phase.conveyor * 100}%` }}
                            />
                        </div>
                        <div className={styles.phaseVizBar}>
                            <div
                                className={styles.phaseVizShimmer}
                                style={{
                                    width: phase.shimmer > 0 ? `${(1 - Math.abs(phase.shimmer - 0.5) * 2) * 100}%` : '0%',
                                    opacity: phase.shimmer > 0 ? 1 : 0.3,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Full-screen test sheet for tuning ring animation parameters
 */
export const RingAnimationTestSheet: React.FC<RingAnimationTestSheetProps> = ({ onClose }) => {
    const [params, setParams] = useState<RingAnimationParams>(DEFAULT_RING_PARAMS);
    const [key, setKey] = useState(0); // For forcing remount
    const [showPhaseViz, setShowPhaseViz] = useState(true);

    const handleParamChange = useCallback((paramKey: keyof RingAnimationParams, value: number) => {
        setParams(prev => ({ ...prev, [paramKey]: value }));
    }, []);

    const handleReset = useCallback(() => {
        setParams(DEFAULT_RING_PARAMS);
        setKey(k => k + 1); // Force remount to restart animation
    }, []);

    const handleRemount = useCallback(() => {
        setKey(k => k + 1);
    }, []);

    const handleCopyConfig = useCallback(() => {
        const config = JSON.stringify(params, null, 2);
        navigator.clipboard.writeText(config);
        console.log('[RingAnimationTest] Config copied:', config);
    }, [params]);

    return (
        <motion.div
            className={styles.ringTestContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
        >
            {/* Preview Area */}
            <div className={styles.ringTestPreview}>
                <WaapiRingVisualizer
                    key={key}
                    isEnabled={true}
                    params={params}
                />
                <div className={styles.ringTestLabel}>Ring Animation Test</div>
            </div>

            {/* Controls Panel */}
            <div className={styles.ringTestControls}>
                <div className={styles.ringTestHeader}>
                    <h3>Parameters</h3>
                    <div className={styles.ringTestActions}>
                        <Button variant="tertiary" size="s" onClick={() => setShowPhaseViz(v => !v)}>
                            <span className="material-symbols-rounded">monitoring</span>
                            Phase
                        </Button>
                        <Button variant="tertiary" size="s" onClick={handleRemount}>
                            <span className="material-symbols-rounded">refresh</span>
                            Remount
                        </Button>
                        <Button variant="tertiary" size="s" onClick={handleReset}>
                            <span className="material-symbols-rounded">restart_alt</span>
                            Reset
                        </Button>
                        <Button variant="tertiary" size="s" onClick={handleCopyConfig}>
                            <span className="material-symbols-rounded">content_copy</span>
                            Copy
                        </Button>
                        <Button variant="tertiary" size="s" onClick={onClose}>
                            <span className="material-symbols-rounded">close</span>
                        </Button>
                    </div>
                </div>

                {/* Phase Visualization */}
                {showPhaseViz && <PhaseVisualization params={params} mountKey={key} />}

                {/* Sync Recipes */}
                <div className={styles.recipeSection}>
                    <div className={styles.recipeLabel}>Sync Recipes</div>
                    <div className={styles.recipeGrid}>
                        {SYNC_RECIPES.map((recipe) => (
                            <button
                                key={recipe.name}
                                className={styles.recipeButton}
                                onClick={() => {
                                    setParams(prev => ({ ...prev, ...recipe.params }));
                                    setKey(k => k + 1);
                                }}
                                title={recipe.description}
                            >
                                {recipe.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.ringTestSliders}>
                    {SLIDER_CONFIGS.map(config => (
                        <div key={config.key} className={styles.ringTestSlider}>
                            <label>
                                {config.label}: {params[config.key]}{config.unit || ''}
                            </label>
                            <input
                                type="range"
                                min={config.min}
                                max={config.max}
                                step={config.step}
                                value={params[config.key]}
                                onChange={(e) => handleParamChange(config.key, parseFloat(e.target.value))}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
