// src/features/Overlays/NfcWriteSheet.tsx
import { useEffect, useState } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { Drawer } from 'vaul';
import {
  nfcWorkflowStateAtom,
  provisionedRoomIdsAtom,
  nfcSimulationAtom
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
          setWorkflow({ status: 'idle' }); // Or selecting
        }
      }, 300);
    }
  };

  // Simulation Logic
  useEffect(() => {
    if (workflow.status === 'ready') {
      // Auto-start writing for prototype feel
      const timer = setTimeout(() => {
         setWorkflow({ ...workflow, status: 'writing' });
      }, 1500); // Give user a moment to see "Ready"
      return () => clearTimeout(timer);
    }

    if (workflow.status === 'writing') {
      const timer = setTimeout(() => {
        // Simulation Outcome
        const isSuccess = simulationMode === 'forceSuccess' || (simulationMode === 'random' && Math.random() > 0.2);
        
        if (isSuccess) {
          setWorkflow({ ...workflow, status: 'success' });
          setProvisionedIds(prev => new Set(prev).add(workflow.roomId));
          triggerHaptic('success');
          playSound('success');
        } else {
          setWorkflow({ 
            ...workflow, 
            status: 'error', 
            error: { code: 'WRITE_FAILED', message: 'Tag connection lost' } 
          });
          triggerHaptic('error');
          playSound('error');
        }
      }, 2000); // Write duration
      return () => clearTimeout(timer);
    }
    
    if (workflow.status === 'success') {
       // Auto close on success
       const timer = setTimeout(() => {
          setIsOpen(false);
          setWorkflow({ status: 'idle' }); // Return to list
       }, 1500);
       return () => clearTimeout(timer);
    }

  }, [workflow, simulationMode, setWorkflow, setProvisionedIds, triggerHaptic, playSound]);

  if (workflow.status === 'idle' || workflow.status === 'selecting') return null;

  const getStatusContent = () => {
    switch (workflow.status) {
      case 'ready':
        return { icon: 'nfc', title: 'Ready to Write', desc: `Hold device near tag to provision ${workflow.roomName}.` };
      case 'writing':
        return { icon: 'nfc', title: 'Writing...', desc: 'Keep device steady.' };
      case 'success':
        return { icon: 'check_circle', title: 'Success', desc: 'Tag provisioned successfully.' };
      case 'error':
        return { icon: 'error', title: 'Write Failed', desc: workflow.error.message };
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

            {workflow.status === 'error' && (
              <div className={styles.buttonGroup}>
                <Button variant="secondary" onClick={() => setIsOpen(false)} className={styles.cancelButton}>Cancel</Button>
                <Button variant="primary" onClick={() => setWorkflow({ ...workflow, status: 'writing' })}>Retry</Button>
              </div>
            )}
            
            {workflow.status === 'ready' && (
               <div className={styles.buttonGroup}>
                  <Button variant="secondary" onClick={() => setIsOpen(false)} className={styles.cancelButton}>Cancel</Button>
               </div>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};