import { Matcher, Result } from '@captaincodeman/router'
import { Plugin } from "../typings";
import { createModel } from 'createModel';
import { Store } from '@captaincodeman/rdx';

export type RoutingState = NonNullable<Result>

export interface Routing {
  push(href: string): void;
  replace(href: string): void;
}

export const routingPluginFactory = (router: Matcher) => {
  // TODO: pass options, e.g. whether to include querystring object in routing state (?)

  return {
    state: {
      name: 'routing',
      model: createModel({
        state: <RoutingState>{ page: '', params: {} },
        reducers: {
          change: (_state, payload: RoutingState): RoutingState => {
            return payload
          }
        }
      }),
      effects: {
        push(href: string) {
          history.pushState(null, '', href)
          dispatchEvent(new Event('popstate'))
        },
        replace(href: string) {
          history.replaceState(null, '', href)
          dispatchEvent(new Event('popstate'))
        },
      },
    },

    onStore(_store: Store) {
      startListener(router, this.dispatcher)
    }
  } as Plugin
}

function startListener(router: Matcher, dispatch: any) {
  // listen for route changes
  const routeChanged = () => {
    const route = router(location.pathname)
    dispatch.routing.change(route)
  }
  window.addEventListener('popstate', routeChanged)

  // although we could populate the initial route at create time
  // it makes things easier if the app can listen for "route changes"
  // in a consistent way without special-casing it
  routeChanged()

  // TODO: provide handler as a strategy pattern as part of config
  // so consumer can chose whether to import the full or partial impl
  // depending on whether they want download support etc... (save bytes?)
  const handler = (e: MouseEvent) => {
    // ignore right-clicks / modifier keys (allow normal browser behavior)
    if ((e.button && e.button !== 0) || e.metaKey || e.altKey || e.ctrlKey ||  e.shiftKey || e.defaultPrevented) {
      return
    }

    // TODO: we could possibly shave off a few bytes for basic use-cases by allowing the 
    // special handling of download and mailto links to be opt-in as a behavior ...
    // ... but probably not worth it

    // ignore non-anchor clicks, window target, download and external links
    const anchor = <HTMLAnchorElement>e.composedPath().find(n => (n as HTMLElement).tagName === 'A')//[0]
    if (!anchor || anchor.target || anchor.hasAttribute('download') || anchor.getAttribute('rel') === 'external') {
      return
    }

    // ignore mailto links
    const href = anchor.href
    if (!href || href.indexOf('mailto:') !== -1) {
      return
    }

    e.preventDefault()

    // don't trigger repeat clicks on current url
    if (href !== location.href) {
      history.pushState(null, '', href)
      routeChanged()
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.document.body.addEventListener('click', handler)
  })
}

// parseQuery creates an additional object based on querystring parameters
// not every app will use this though so we can save adding it by making it
// optional
function parseQuery(params: URLSearchParams) {
  const q: { [key: string]: string | string[] } = {}
  for (const p of params.entries()) {
    const [ k, v ] = p
    const c = q[k]
    if (c) {
        if (Array.isArray(c)) {
          c.push(v)
        } else {
          q[k] = [c, v]
        }
    } else {
      q[k] = v
    }
  }
  return q
}
