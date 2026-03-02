import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'coffee-reduction-challenge',
  brand: {
    displayName: '커피 줄이기 챌린지',
    primaryColor: '#005DF5',
    icon: 'https://static.toss.im/icons/png/4x/icon-person-man.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
    allowsBackForwardNavigationGestures: false,
    pullToRefreshEnabled: true,
  },
});
