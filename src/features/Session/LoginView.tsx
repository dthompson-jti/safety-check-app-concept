// src/features/Session/LoginView.tsx
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { motion } from 'framer-motion';
import { sessionAtom } from '../../data/atoms';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { Modal } from '../../components/Modal';
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
      // SECURITY BEST PRACTICE: Generic error message.
      setFormError('Incorrect username or password.');
    }
  };

  const handleShortcutLogin = () => {
    setSession({ isAuthenticated: true, userName: 'Dev Shortcut' });
  };

  // Reset errors when user starts typing to provide immediate feedback loop
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
        <main className={styles.mainContent}>
          <div className={styles.loginFormCard}>
            <div className={styles.appTitle}>
              <span
                className={`material-symbols-rounded ${styles.shortcutIcon}`}
                onClick={handleShortcutLogin}
                title="Developer Shortcut Login"
              >
                shield
              </span>
              <h3>eProbation Mobile</h3>
            </div>
            <form onSubmit={handleLogin} className={styles.formFields} noValidate>
              
              <motion.div
                animate={isAttempted && formError ? shakeAnimation : {}}
                onAnimationComplete={() => setIsAttempted(false)}
              >
                {formError && (
                  <div className={styles.formError}>
                    <span className="material-symbols-rounded">dangerous</span>
                    <span>{formError}</span>
                  </div>
                )}
              </motion.div>

              <motion.div animate={isAttempted && usernameError ? shakeAnimation : {}}>
                <TextInput
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  isInvalid={!!passwordError}
                />
                {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
              </motion.div>

              <Button type="submit" variant="primary" size="m" style={{ width: '100%', marginTop: '8px' }}>
                Log In
              </Button>
              <div className={styles.supportLink}>
                <button type="button" onClick={() => setIsHelpModalOpen(true)}>Trouble signing in?</button>
              </div>
            </form>
          </div>
        </main>

        <footer className={styles.pageFooter}>
          <p>&copy; Journal Technologies 2025.</p>
          <p>
            <a href="#privacy">Privacy Policy</a>
            <span className={styles.footerSeparator}>&middot;</span>
            <a href="#terms">Terms of Use</a>
          </p>
        </footer>
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
          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
            <Button variant="secondary" onClick={() => setIsHelpModalOpen(false)} style={{ width: '100%' }}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};