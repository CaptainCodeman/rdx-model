import { Matcher, Result } from '@captaincodeman/router'
import { Plugin, RoutingState, RoutingOptions, RoutingDispatch } from "../typings";
import { createModel } from 'createModel';
import { Store } from '@captaincodeman/rdx';

export const routingPluginFactory = (router: Matcher, options?: Partial<RoutingOptions>) => {
  const opt = <RoutingOptions>{
    handler: simpleClickHandler,
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
      window.addEventListener('click', (e: MouseEvent) => {
        const href = opt.handler(e)
        // handler returns null if we're not to handle it
        if (href) {
          e.preventDefault()
          history.pushState(null, '', href)
          dispatchEvent(new Event('popstate'))
        }
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

// link is 'internal' to the app if it's within the baseURI of the page (handles sub-apps)
const isInternal = (a: HTMLAnchorElement) => a.href.startsWith(document.baseURI)

// external isn't just !internal, it's having an attribute explicitly marking it as such
const isExternal = (a: HTMLAnchorElement) => (a.getAttribute('rel') || '').includes('external')

// download links may be within the app so need to be specifically ignored if utilized
const isDownload = (a: HTMLAnchorElement) => a.hasAttribute('download')

// if the link is meant to open in a new tab or window, we need to allow it to function
const isTargeted = (a: HTMLAnchorElement) => a.target

// if a non-default click or modifier key is used with the click, we leave native behavior
const isSpecialClick = (e: MouseEvent) => (e.button && e.button !== 0) 
                                        || e.metaKey
                                        || e.altKey
                                        || e.ctrlKey
                                        || e.shiftKey
                                        || e.defaultPrevented;

// get the anchor element clicked on, taking into account shadowDom components
const getAnchor = (e: MouseEvent) => <HTMLAnchorElement>e.composedPath().find(n => (n as HTMLElement).tagName === 'A')

// simple handler just ignores external links, but pulls in less code
export const simpleClickHandler = (e: MouseEvent) => {
  const anchor = getAnchor(e)
  return (anchor && isInternal(anchor))
    ? anchor.href
    : null
}

// standard handler contains complete logic for what to ignore
export const clickHandler = (e: MouseEvent) => {
  const anchor = getAnchor(e)
  return (anchor
      && isInternal(anchor) 
      && !isDownload(anchor) 
      && !isExternal(anchor) 
      && !isTargeted(anchor)
      && !isSpecialClick(e))
    ? anchor.href
    : null
}

// parseQuery creates an additional object based on querystring parameters
// not every app will require this so we can make it optional by setting 
// the transform to withQuerystring

export const withQuerystring = (result: Result) => {
  const params = new URLSearchParams(location.search)
  const queries = parseQuery(params)
  return <RoutingState>{ ...result, queries }
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

export const fullRoutingPluginFactory = (router: Matcher) => routingPluginFactory(router, {
  handler: clickHandler,
  transform: withQuerystring,
})