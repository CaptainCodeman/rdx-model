import { assert, Has, IsExact } from "conditional-type-checks";

import createMatcher from '@captaincodeman/router';

import { StoreDispatch, StoreState } from '../store';
import { createModel } from '../model';
import { routingPluginFactory, RoutingState } from '../routing';

const routes = {
  '/test': 'test-view',
};

const matcher = createMatcher(routes);
const routing = routingPluginFactory(matcher);

const config = {
  models: {
    count: createModel({
      state: 0,
      reducers: {
        inc(state) {
          return state + 1;
        },
        incBy(state, val: number) {
          return state + val;
        },
      }
    }),
  },
  plugins: {
    routing,
  }
};

type dispatch = StoreDispatch<typeof config>;

assert<Has<dispatch, {
  count: { 
    inc: () => void,
    incBy: (payload: number) => void
  },
  routing: { 
    back: () => void,
    change: (payload: RoutingState) => void,
    forward: () => void,
    go: (payload: number) => void,
    push: (payload: string) => void,
    replace: (payload: string) => void,
  },
}>>(true);

type state = StoreState<typeof config>;

assert<IsExact<{
  count: number,
  routing: RoutingState,
}, state>>(true);
