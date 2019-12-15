import { Matcher, Result } from '@captaincodeman/router'
import { Plugin, RoutingState, RoutingOptions, RoutingDispatch } from "../typings";
import { createModel } from 'createModel';
import { Store } from '@captaincodeman/rdx';

export const routingPluginFactory = (router: Matcher, options?: Partial<RoutingOptions>) => {
  // TODO: pass options, e.g. whether to include querystring object in routing state (?)
  const opt = <RoutingOptions>{
    handler: defaultHandler,
    transform: (result) => result,
    ...options,
  }

  return {
    state: {
      name: 'routing',
      model: createModel({
        state: <RoutingState>{ page: '', params: {} },
        reducers: {
          change: (_state, payload: RoutingState): RoutingState => {
            return payload
          }
        },
        effects: (_dispatch, _getState) => ({
          push(href: string) {
            history.pushState(null, '', href)
            dispatchEvent(new Event('popstate'))
          },
          replace(href: string) {
            history.replaceState(null, '', href)
            dispatchEvent(new Event('popstate'))
          },
        }),
      }),
    },

    async onStore(store: Store) {
      const dispatch: RoutingDispatch = store.dispatch['routing']
      
      // listen for route changes
      const routeChanged = () => {
        const route = router(location.pathname)
        if (route) {
          dispatch.change(opt.transform(route))
        }
      }
      window.addEventListener('popstate', routeChanged)

      // listen for click events
      window.addEventListener('DOMContentLoaded', () => {
        window.document.body.addEventListener('click', opt.handler)
      })

      // although we _could_ populate the initial route at create time
      // it makes things easier if the app can listen for "route changes"
      // in a consistent way without special-casing it. We await so that
      // if the devtools middleware is being added, this initial dispatch
      // can be captured
      await Promise.resolve()
      routeChanged()
    }
  } as Plugin
}

const defaultHandler = (e: MouseEvent) => {
  // ignore non-anchor clicks, window target, download and external links
  const anchor = <HTMLAnchorElement>e.composedPath().find(n => (n as HTMLElement).tagName === 'A')
  if (anchor) {
    const href = anchor.href
    e.preventDefault()
    if (href && href !== location.href) {
      history.pushState(null, '', href)
      dispatchEvent(new Event('popstate'))
    }
  }
}

export const fullHandler = (e: MouseEvent) => {
  // ignore right-clicks / modifier keys (allow normal browser behavior)
  if ((e.button && e.button !== 0) || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.defaultPrevented) {
    return
  }

  // ignore non-anchor clicks, window target, download and external links
  const anchor = <HTMLAnchorElement>e.composedPath().find(n => (n as HTMLElement).tagName === 'A')
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
    dispatchEvent(new Event('popstate'))
  }
}

// parseQuery creates an additional object based on querystring parameters
// not every app will use this though so we can save adding it by making it
// optional

export const withQuerystring = (result: Result) => {
  const params = new URLSearchParams(location.search)
  const queries = parseQuery(params)
  return { ...result, ...queries }
}

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
