const routes = [
  // "coming soon" gate – stands alone, without the app's header and menu
  { path: '/access', name: 'access', component: () => import('@/pages/AccessPage.vue') },

  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      /* ---------- the game-book ---------- */
      { path: '', name: 'cover', component: () => import('@/pages/CoverPage.vue') },
      { path: 'rules', name: 'rules', component: () => import('@/pages/RulesPage.vue') },
      { path: 'creators', name: 'creators', component: () => import('@/pages/CreatorsPage.vue') },
      { path: 'support', name: 'support', component: () => import('@/pages/SupportPage.vue') },
      { path: 'privacy', name: 'privacy', component: () => import('@/pages/PrivacyPage.vue') },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/pages/LoginPage.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/pages/RegisterPage.vue'),
        meta: { guestOnly: true },
      },
      {
        path: 'hero',
        name: 'hero',
        component: () => import('@/pages/CreateHeroPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'play',
        name: 'play',
        component: () => import('@/pages/PlayPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/pages/ProfilePage.vue'),
        meta: { requiresAuth: true },
      },

      /* ---------- the practice room (the original Kitarista tools) ---------- */
      { path: 'compas', name: 'compas', component: () => import('@/pages/IndexPage.vue') },
      {
        path: 'intervals',
        name: 'intervals',
        component: () => import('@/pages/GuitarIntervalsPage.vue'),
      },
      { path: 'scales', name: 'scales', component: () => import('@/pages/GuitarScalesPage.vue') },
      { path: 'chords', name: 'chords', component: () => import('@/pages/GuitarChordsPage.vue') },
      {
        path: 'flamenco',
        name: 'flamenco',
        component: () => import('@/pages/GuitarFlamencoPage.vue'),
      },
      { path: 'tuner', name: 'tuner', component: () => import('@/pages/GuitarTunerPage.vue') },
      { path: 'about', name: 'about', component: () => import('@/pages/AboutPage.vue') },
      { path: 'notes', name: 'notes', component: () => import('@/pages/NotesSheetPage.vue') },
      { path: 'tones', name: 'tones', component: () => import('@/pages/GuitarTonesPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
