// src/features/Login/LoginView.tsx
import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionAtom } from '../../data/atoms';
import { addToastAtom } from '../../data/toastAtoms';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import styles from './LoginView.module.css';

export const LoginView = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAttempted, setIsAttempted] = useState(false);
  const setSession = useSetAtom(sessionAtom);
  const addToast = useSetAtom(addToastAtom);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAttempted(true);

    if (username.trim() === '') {
      addToast({
        message: 'Username cannot be empty',
        icon: 'error',
      });
      return;
    }

    setSession({ isAuthenticated: true, userName: username.trim() });
  };

  const shakeAnimation = {
    x: [0, -8, 8, -8, 8, 0],
    transition: { duration: 0.4 },
  };

  return (
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
          <span className="material-symbols-rounded">shield</span>
          <h3>eSupervision Mobile</h3>
        </div>
        <AnimatePresence>
          <motion.form
            onSubmit={handleLogin}
            className={styles.formFields}
            animate={isAttempted && !username.trim() ? shakeAnimation : {}}
            onAnimationComplete={() => setIsAttempted(false)}
          >
            <TextInput
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="m"
              style={{ width: '100%' }}
            >
              Log In
            </Button>
          </motion.form>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};