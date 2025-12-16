// src/features/Session/LoginView.tsx
import { useState, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { sessionAtom } from '../../data/atoms';
import { dispatchActionAtom } from '../../data/appDataAtoms';
import { findUser } from '../../data/users';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Modal } from '../../components/Modal';
import { useScrollToFocused } from '../../data/useScrollToFocused';
import { JournalLogo, ErrorIcon } from '../../components/CriticalIcons';
import { APP_VERSION } from '../../config';
import styles from './LoginView.module.css';

export const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAttempted, setIsAttempted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setSession = useSetAtom(sessionAtom);
  const dispatch = useSetAtom(dispatchActionAtom);

  // Layout Stability Hook
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollToFocused({
    containerRef: scrollContainerRef,
    // No sticky footer in LoginView, so no offset variable needed.
    offset: 20
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttempted(true);
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    let hasError = false;
    if (username.trim() === '') {
      setUsernameError('Username is required.');
      hasError = true;
    }
    if (password.trim() === '') {
      setPasswordError('Password is required.');
      hasError = true;
    }
    if (hasError) return;

    // Validate password first (always 'test')
    if (password.trim() !== 'test') {
      setFormError('Incorrect username or password.');
      return;
    }

    // Find user in MOCK_USERS
    const user = findUser(username.trim());
    if (user) {
      // Show loading state, then transition after brief delay
      setIsSubmitting(true);
      setTimeout(() => {
        dispatch({ type: 'RESET_DATA' });
        setSession({ isAuthenticated: true, user });
      }, 500);
    } else {
      setFormError('Incorrect username or password.');
    }
  };

  const handleShortcutLogin = () => {
    // Disable layoutId to prevent distortion during exit
    setIsExiting(true);
    // Use same loading UX as normal login
    const user = findUser('dthompson');
    if (user) {
      setIsSubmitting(true);
      setTimeout(() => {
        dispatch({ type: 'RESET_DATA' });
        setSession({ isAuthenticated: true, user });
      }, 500);
    }
  };

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (usernameError) setUsernameError('');
    if (formError) setFormError('');
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError('');
    if (formError) setFormError('');
  };

  const shakeAnimation = {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  };

  // Staggered animation for content entry (after logo transition)
  const contentContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 } // Delay to allow logo layoutId to settle
    }
  };

  const contentItemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <>
      <motion.div
        key="login-view"
        className={styles.viewportStack}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.scrollableContent} ref={scrollContainerRef}>
          <motion.div
            className={styles.loginFormCard}
            variants={contentContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={styles.appTitle}>
              <motion.div layoutId={isExiting ? undefined : "app-logo"}>
                <JournalLogo
                  size={144}
                  className={styles.shortcutIcon}
                  onClick={handleShortcutLogin}
                  title="Developer Shortcut Login"
                />
              </motion.div>
              {/* Title appears AFTER logo settles via stagger */}
              <motion.h3 variants={contentItemVariants}>Safeguard</motion.h3>
            </div>
            <motion.form
              onSubmit={handleLogin}
              className={styles.formFields}
              noValidate
              variants={contentItemVariants}
            >

              <motion.div
                animate={isAttempted && formError ? shakeAnimation : {}}
                onAnimationComplete={() => setIsAttempted(false)}
              >
                {formError && (
                  <div className={styles.formError}>
                    <ErrorIcon size={20} />
                    <span>{formError}</span>
                  </div>
                )}
              </motion.div>

              <motion.div
                variants={contentItemVariants}
                animate={isAttempted && usernameError ? shakeAnimation : {}}
              >
                <TextInput
                  type="text"
                  placeholder="Username"
                  aria-label="Username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  isInvalid={!!usernameError}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  enterKeyHint="next"
                  className={styles.usernameInput}
                />
                {usernameError && <div className={styles.errorMessage}>{usernameError}</div>}
              </motion.div>

              <motion.div variants={contentItemVariants}
                animate={isAttempted && passwordError ? shakeAnimation : {}}
              >
                <TextInput
                  type="password"
                  placeholder="Password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  isInvalid={!!passwordError}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="current-password"
                  enterKeyHint="go"
                />
                {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
              </motion.div>

              <motion.div variants={contentItemVariants}>
                <Button type="submit" variant="primary" size="m" loading={isSubmitting} loadingText="Signing in..." style={{ width: '100%', marginTop: 'var(--spacing-2)' }}>
                  Log In
                </Button>
              </motion.div>
              <motion.div variants={contentItemVariants} className={styles.supportLink}>
                <button type="button" onClick={() => setIsHelpModalOpen(true)}>Trouble signing in?</button>
              </motion.div>
            </motion.form>
          </motion.div>

          <footer className={styles.pageFooter}>
            <p>&copy; 2025 Journal Technologies Inc.</p>
            <p>
              <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <span className={styles.footerSeparator}>&middot;</span>
              <a href="#" onClick={(e) => e.preventDefault()}>Terms of Use</a>
            </p>
            <div className={styles.versionDisplay}>
              v{APP_VERSION.replace('v', '')}
            </div>
          </footer>
        </div>
      </motion.div>

      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="How to Sign In"
        width="90%"
        height="auto"
        description="Information on how to sign in to the prototype application."
      >
        <Modal.Content>
          <div className={styles.modalBodyLayout}>
            <div className={styles.modalTextContent}>
              <h3>How to Sign In</h3>
              <p>
                To sign-in, use your eSeries credentials. To change your password, go to eSeries and select reset password.
              </p>
              <div
                className={styles.infoNote}
                data-appearance-type="tertiary"
                data-bordered="true"
              >
                <h4>Password & Account Help</h4>
                <ul>
                  <li>This prototype does not support actual password resets.</li>
                  <li>In a production environment, this section would contain agency-specific instructions or links to a self-service portal.</li>
                </ul>
              </div>
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => setIsHelpModalOpen(false)} style={{ width: '100%' }}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};