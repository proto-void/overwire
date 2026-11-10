import { mount } from 'svelte';
import { browser } from 'wxt/browser';
import { brandDefaultTheme } from '../../ui/brand-config';
import { applyTheme, loadTheme } from '../../ui/theme';
import App from './App.svelte';
import '../../ui/base.css';

let theme = brandDefaultTheme;
try {
  theme = await loadTheme(browser.storage.local);
} catch {
  theme = brandDefaultTheme;
}
applyTheme(theme);
mount(App, { target: document.getElementById('app')! });
