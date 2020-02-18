import { StoreState, StoreDispatch } from '../store';

import { testConfig } from './effects-config';
import { EffectStore } from '../model';

export interface State extends StoreState<typeof testConfig> {}
export interface Dispatch extends StoreDispatch<typeof testConfig> {}
export interface Store extends EffectStore<Dispatch, State> {}
