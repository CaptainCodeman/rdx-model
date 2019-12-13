import { Plugin, Model, Context } from "../typings";
import { actionType } from "actionType";

export const createDispatcher = (context: Context, name: string, key: string) => {
  const type = actionType(name, key)
  context.dispatcher[name][key] = (payload?: any): any => {
    const action = { type, ...(payload !== undefined && { payload }) }
    return context.dispatch(action)
  }
  return type
}

export const dispatchPlugin: Plugin = {
  onInit() {
    this.dispatcher = {}
  },

  onModel(name: string, model: Model) {
    this.dispatcher[name] = {}

    for (const key in model.reducers) {
      createDispatcher(this, name, key)
    }
  }
}