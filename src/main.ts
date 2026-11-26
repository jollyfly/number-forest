import { registerSW } from 'virtual:pwa-register';
import { startApp } from './app';
import './styles/main.css';

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
}

const root = document.querySelector<HTMLElement>('#app');
if (root) startApp(root);
