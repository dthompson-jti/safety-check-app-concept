// src/features/Session/LoginView.tsx
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { sessionAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Modal } from '../../components/Modal';
import { FullScreenPlaceholder } from '../../components/FullScreenPlaceholder';
import styles from './LoginView.module.css';

export const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAttempted, setIsAttempted] = useState(false);
  const setSession = useSetAtom(sessionAtom);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttempted(true);
    // ARCHITECTURE: Always clear previous errors on a new submission attempt.
    setUsernameError('');
    setPasswordError('');
    setFormError('');

    // STAGE 1: Client-side validation for simple, common errors (e.g., empty fields).
    // This provides immediate, specific feedback without a "server" roundtrip.
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

    // STAGE 2: Credential validation.
    if (username.trim() === 'test' && password.trim() === 'test') {
      // On success, authenticate the user.
      setSession({ isAuthenticated: true, userName: username.trim() });
    } else {
      // SECURITY BEST PRACTICE: For any failed login, show a single, generic
      // error. This prevents "username enumeration" where an attacker could
      // otherwise determine if a username is valid or not.
      setFormError('The username or password you entered is incorrect.');
    }
  };

  /** A developer-only shortcut to bypass the login screen for faster iteration. */
  const handleShortcutLogin = () => {
    setSession({ isAuthenticated: true, userName: 'Dev Shortcut' });
  };

  // UX: A subtle "shake" animation provides strong visual feedback for an error.
  const shakeAnimation = {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  };

  return (
    <>
      <motion.div
        key="login-view"
        className={styles.loginViewWrapper}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.loginFormCard}>
          <div className={styles.appTitle}>
            <span
              className={`material-symbols-rounded ${styles.shortcutIcon}`}
              onClick={handleShortcutLogin}
              title="Developer Shortcut Login"
            >
              shield
            </span>
            <h3>eSupervision Mobile</h3>
          </div>
          <form onSubmit={handleLogin} className={styles.formFields} noValidate>
            {/* The form-level error animates the entire form for a general failure. */}
            <motion.div
              animate={isAttempted && formError ? shakeAnimation : {}}
              onAnimationComplete={() => setIsAttempted(false)}
            >
              {formError && <div className={styles.formError}>{formError}</div>}
            </motion.div>
            
            {/* Inline errors animate just the specific input that has an issue. */}
            <motion.div animate={isAttempted && usernameError ? shakeAnimation : {}}>
              <TextInput
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!!usernameError}
                autoFocus
              />
              {usernameError && <div className={styles.errorMessage}>{usernameError}</div>}
            </motion.div>
            
            <motion.div animate={isAttempted && passwordError ? shakeAnimation : {}}>
              <TextInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!passwordError}
              />
              {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
            </motion.div>
            
            <Button type="submit" variant="primary" size="m" style={{ width: '100%', marginTop: '8px' }}>
              Log In
            </Button>
          </form>
          <div className={styles.supportLink}>
            <button type="button" onClick={() => setIsHelpModalOpen(true)}>Trouble signing in?</button>
          </div>
        </div>
      </motion.div>

      {/* The assistance modal manages expectations about prototype functionality. */}
      <Modal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        title="Assistance"
        width="90%"
        height="auto"
        description="Information about prototype login assistance."
      >
        <Modal.Content>
          <FullScreenPlaceholder
            icon="help"
            title="Assistance"
            message="This is a high-fidelity prototype. In a production application, this screen would guide you through a secure password reset process. For now, please use the provided test credentials or contact your administrator for access."
          />
        </Modal.Content>
        <Modal.Footer>
          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Button variant="primary" onClick={() => setIsHelpModalOpen(false)}>
              Got it
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};