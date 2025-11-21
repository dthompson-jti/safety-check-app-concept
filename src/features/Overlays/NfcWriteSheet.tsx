// src/features/Overlays/NfcWriteSheet.tsx
import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import {
  nfcWorkflowStateAtom,
  provisionedRoomIdsAtom,
  nfcSimulationAtom,
  NfcError
} from '../../data/nfcAtoms';
import { Button } from '../../components/Button';
import { useHaptics } from '../../data/useHaptics';
import { useAppSound } from '../../data/useAppSound';
import styles from './NfcWriteSheet.module.css';

export const NfcWriteSheet = () => {
  const [workflow, setWorkflow] = useAtom(nfcWorkflowStateAtom);
  const setProvisionedIds = useSetAtom(provisionedRoomIdsAtom);
  const [simulationMode] = useAtom(nfcSimulationAtom);
  
  const { trigger: triggerHaptic } = useHaptics();
  const { play: playSound } = useAppSound();

  const [isOpen, setIsOpen] = useState(false);

  // Sync Atom State with Sheet Visibility
  useEffect(() => {
    if (workflow.status !== 'idle' && workflow.status !== 'selecting') {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [workflow.status]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset to selecting mode if closed manually
      setTimeout(() => {
        if (workflow.status !== 'idle') {
          setWorkflow({ status: 'idle' });
        }
      }, 300);
    }
  };

  // Developer Simulation Trigger
  const handleDevAction = (action: 'success' | 'net-error' | 'locked-error') => {
    triggerHaptic('light');
    
    // Transition to writing first for a split second to feel like an action,
    // then resolve to the specific state.
    setWorkflow((prev) => {
      if (prev.status === 'ready' || prev.status === 'error') {
        return { 
          status: 'writing', 
          roomId: prev.roomId, 
          roomName: prev.roomName 
        };
      }
      return prev;
    });

    setTimeout(() => {
      if (action === 'success') {
        if ('roomId' in workflow) {
           // We need the IDs from the current workflow state
           const { roomId, roomName } = workflow as { roomId: string, roomName: string };
           setWorkflow({ status: 'success', roomId, roomName });
           setProvisionedIds(prev => new Set(prev).add(roomId));
           triggerHaptic('success');
           playSound('success');
        }
      } else if (action === 'net-error') {
        if ('roomId' in workflow) {
           const { roomId, roomName } = workflow as { roomId: string, roomName: string };
           const error: NfcError = { code: 'WRITE_FAILED', message: 'Network connection lost' };
           setWorkflow({ status: 'error', roomId, roomName, error });
           triggerHaptic('error');
           playSound('error');
        }
      } else if (action === 'locked-error') {
        if ('roomId' in workflow) {
           const { roomId, roomName } = workflow as { roomId: string, roomName: string };
           const error: NfcError = { code: 'TAG_LOCKED', message: 'Tag is write-locked' };
           setWorkflow({ status: 'error', roomId, roomName, error });
           triggerHaptic('error');
           playSound('error');
        }
      }
    }, 500);
  };

  // Simulation Logic
  useEffect(() => {
    // FIX: Use ReturnType<typeof setTimeout> to avoid NodeJS namespace dependency
    let timer: ReturnType<typeof setTimeout>;

    // NOTE: Auto-advance removed for 'ready' state per requirements.
    // User must use Developer Controls to proceed in this prototype.

    if (workflow.status === 'writing') {
      timer = setTimeout(() => {
        // Simulation Outcome based on global setting
        // This only runs if 'writing' was triggered by something OTHER than the Dev Actions above
        // (which handle their own outcome). This block handles the generic "Retry" button case.
        const isSuccess = simulationMode === 'forceSuccess' || (simulationMode === 'random' && Math.random() > 0.2);
        
        if ('roomId' in workflow) {
            const { roomId, roomName } = workflow as { roomId: string, roomName: string };
            
            if (isSuccess) {
              setWorkflow({ status: 'success', roomId, roomName });
              setProvisionedIds(prev => new Set(prev).add(roomId));
              triggerHaptic('success');
              playSound('success');
            } else {
              setWorkflow({ 
                status: 'error', 
                roomId,
                roomName,
                error: { code: 'WRITE_FAILED', message: 'Tag connection lost' } 
              });
              triggerHaptic('error');
              playSound('error');
            }
        }
      }, 2000);
    }
    
    if (workflow.status === 'success') {
       // Auto close on success
       timer = setTimeout(() => {
          setIsOpen(false);
          setWorkflow({ status: 'idle' }); 
       }, 1500);
    }

    return () => clearTimeout(timer);

  }, [workflow, simulationMode, setWorkflow, setProvisionedIds, triggerHaptic, playSound]);

  if (workflow.status === 'idle' || workflow.status === 'selecting') return null;

  const getStatusContent = () => {
    switch (workflow.status) {
      case 'ready':
        return { icon: 'nfc', title: 'Ready to Write', desc: `Hold device near tag to provision ${'roomName' in workflow ? workflow.roomName : 'room'}.` };
      case 'writing':
        return { icon: 'nfc', title: 'Writing...', desc: 'Keep device steady.' };
      case 'success':
        return { icon: 'check_circle', title: 'Success', desc: 'Tag provisioned successfully.' };
      case 'error':
        return { icon: 'error', title: 'Write Failed', desc: 'error' in workflow ? workflow.error.message : 'Unknown error' };
      default:
        return { icon: 'nfc', title: '', desc: '' };
    }
  };

  const content = getStatusContent();

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} dismissible={workflow.status !== 'writing'}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.contentWrapper}>
          <div className={styles.content}>
            {/* Restored Handle */}
            <div className={styles.handleContainer}>
              <div className={styles.handle} />
            </div>

            <div className={styles.iconContainer}>
              <span 
                className={`material-symbols-rounded ${styles.nfcIcon}`} 
                data-state={workflow.status}
              >
                {content.icon}
              </span>
            </div>
            
            <h3 className={styles.title}>{content.title}</h3>
            <p className={styles.description}>{content.desc}</p>

            {/* Error Actions - UPDATED: Retry Left, Cancel Right */}
            {workflow.status === 'error' && (
              <div className={styles.buttonGroup}>
                <Button 
                  variant="primary" 
                  onClick={() => setWorkflow({ 
                    status: 'writing', 
                    roomId: workflow.roomId, 
                    roomName: workflow.roomName 
                  })} 
                  className={styles.actionButton}
                >
                  Retry
                </Button>
                <Button variant="secondary" onClick={() => setIsOpen(false)} className={styles.actionButton}>Cancel</Button>
              </div>
            )}
            
            {/* Ready Actions */}
            {workflow.status === 'ready' && (
               <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setIsOpen(false)} className={styles.cancelButton}>Cancel</Button>
               </div>
            )}

            {/* Developer Tools - Only visible in Ready state */}
            {workflow.status === 'ready' && (
              <div className={styles.devToolsContainer}>
                <span className={styles.devToolsLabel}>Developer Controls</span>
                <div className={styles.devButtons}>
                  <Button variant="tertiary" size="s" onClick={() => handleDevAction('success')}>Success</Button>
                  <Button variant="tertiary" size="s" onClick={() => handleDevAction('net-error')}>Net Error</Button>
                  <Button variant="tertiary" size="s" onClick={() => handleDevAction('locked-error')}>Locked</Button>
                </div>
              </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};