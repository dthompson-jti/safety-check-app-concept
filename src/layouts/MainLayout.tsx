// src/layouts/MainLayout.tsx
import { FloatingHeader } from '../features/Header/FloatingHeader';
import { FloatingFooter } from '../features/Footer/FloatingFooter';
import { SideMenu } from '../features/NavBar/SideMenu';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <>
      <SideMenu />
      <div className={styles.appShell}>
        <FloatingHeader />
        <main className={styles.mainContent}>{children}</main>
        <FloatingFooter />
      </div>
    </>
  );
};