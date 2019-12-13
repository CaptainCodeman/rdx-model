import { Plugin, Model } from "../typings";
import { createDispatcher } from "./dispatchPlugin";
import { Store, ActionEvent, Action } from "@captaincodeman/rdx";

export const effectsPlugin: Plugin = {
  onInit() {
    this.effects = {}
    // we create these because we need to pass the store functions into
    // the models 'effects' creator function but we can't pass the store
    // methods themselves because they won't exist at that point, but we
    // know they will exist by the time we call them so we will pass in
    // functions that will delegate to those 'functions to come later'
    this.dispatchWrapper = (action: Action<any>) => this.dispatch(action)
    this.getStateWrapper = () => this.getState()
  },

  onModel(name: string, model: Model) {
    if (!model.effects) {
      return
    }

    const dispatcher = this.dispatcher[name]
    const modelEffects = model.effects.call(dispatcher, this.dispatchWrapper, this.getStateWrapper)

    for (const key in modelEffects) {
      const type = createDispatcher(this, name, key)
      const effect = modelEffects[key].bind(dispatcher)

      // effects are a list, because multiple models may want to listen to the same 
      // action type (e.g. routing/change) and we want to trigger _all_ of them ...
      if (this.effects[type]) {
        this.effects[type].push(effect)
      } else {
        this.effects[type] = [effect]
      }
    }
  },

  onStore(store: Store) {
    store.addEventListener('state', async e => {
      const { action } = (<CustomEvent<ActionEvent>>e).detail
      const effects = this.effects[action.type!]
      if (effects) {
        // allow the triggering action to be reduced first
        await Promise.resolve()

        // does await allow us to call other effects? do we want / need that?
        // await Promise.all(effects.map(effect => effect(action.payload)))
        effects.forEach(effect => effect(action.payload))
      }
    })
  },
}