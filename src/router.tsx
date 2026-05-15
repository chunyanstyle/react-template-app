import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { getContext } from './integrations/tanstack-query/root-provider'
import { routeTree } from './routeTree.gen'

/**
 * `import.meta.env.BASE_URL` 与 Vite `base` 一致；Router 的 basepath 不要末尾 `/`
 */
function routerBasepathFromViteBaseUrl(viteBaseUrl: string): string {
  if (viteBaseUrl === '/') {
    return '/'
  }
  return viteBaseUrl.replace(/\/+$/, '')
}

export function getRouter() {
  const router = createTanStackRouter({
    basepath: routerBasepathFromViteBaseUrl(import.meta.env.BASE_URL),
    routeTree,
    context: getContext(),
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
