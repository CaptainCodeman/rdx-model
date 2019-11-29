import { Plugin, Model } from "../typings";
import { createDispatcher } from "./dispatchPlugin";
import { Dispatch, Store, StoreEvent } from "@captaincodeman/rdx";

export const effectsPlugin: Plugin = {
  onInit() {
    this.effects = {}
  },

  onModel(name: string, model: Model) {
    if (!model.effects) {
      return
    }

    const dispatcher = this.dispatcher[name]

    for (const key in model.effects) {
      const type = createDispatcher(this, name, key)
      const effect = model.effects[key].bind(dispatcher)

      const effectCaller = (payload: any, getState: () => any, dispatch: Dispatch) => 
        effect(payload, getState, dispatch)

      // effects are a list, because multiple models may want to listen to the same 
      // action type (e.g. routing/change) and we want to trigger all of them
      if (this.effects[type]) {
        this.effects[type].push(effectCaller)
      } else {
        this.effects[type] = [effectCaller]
      }
    }
  },

  onStore(store: Store) {
    // TODO: if any model had an 'init' effect, execute it automatically to provide
    // an easy "run this on startup" for any module (e.g. to pre-load data or whatever)
    store.addEventListener('state', async e => {
      const { action } = (<CustomEvent<StoreEvent>>e).detail
      const effects = this.effects[action.type!]
      if (effects) {
        await Promise.all(effects.map(effect => effect(action.payload, () => store.state, store.dispatch)))
      }
    })
  },

  // middleware(this: Context, store: Store) {
  //   return next => async (action: AnyAction) => {
  //     const result = next(action)
  //     const effects = this.effects[action.type!]
  //     if (effects) {
  //       await Promise.all(effects.map(effect => effect(action.payload, () => store.state, store.dispatch)))
  //     }
      
  //     return result
  //   }
  // }
}