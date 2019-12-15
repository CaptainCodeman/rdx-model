import { Plugin, Model } from "../typings";

const prefix = '@redux-remodel-saga/'

export const take = actionType => ({ type: prefix + 'take', actionType })
export const select = selector => ({ type: prefix + 'select', selector })
export const call = (fn, ...args) => ({ type: prefix + 'call', fn, args })
export const put = action => ({ type: prefix + 'put', action })
export const fork = (saga, ...args) => ({ type: prefix + 'fork', saga, args })
export const cancel = (task) => ({})
export const cancelled = (task) => ({})

export const takeEvery = (actionType, saga, ...args) => fork(function* newSaga() {
  while (true) {
    const action = yield take(actionType)
    yield fork(saga, ...args.concat(action))
  }
})

export const takeLatest = (actionType, saga, ...args) => fork(function*() {
  let lastTask
  while (true) {
    const action = yield take(actionType)
    if (lastTask) {
      yield cancel(lastTask) // cancel is no-op if the task has already terminated
    }
    lastTask = yield fork(saga, ...args.concat(action))
  }
})

// export const throttle = (ms, actionType, task, ...args) => fork(function*() {
//   const throttleChannel = yield actionChannel(pattern, buffers.sliding(1))

//   while (true) {
//     const action = yield take(throttleChannel)
//     yield fork(task, ...args, action)
//     yield delay(ms)
//   }
// })

// export const debounce = (ms, actionType, task, ...args) => fork(function*() {
//   while (true) {
//     let action = yield take(actionType)

//     while (true) {
//       const { debounced, latestAction } = yield race({
//         debounced: delay(ms),
//         latestAction: take(actionType)
//       })

//       if (debounced) {
//         yield fork(task, ...args, action)
//         break
//       }

//       action = latestAction
//     }
//   }
// })

// race, all, delay, throttle / debounce, retry, fork join spawn

export async function runSaga(store, saga, ...args) {
  try {
    const it = saga(...args)

    let result = it.next()
    while (!result.done) {
      const effect = result.value

      switch (effect.type) {
        case 'call':
          result = it.next(await effect.fn(...effect.args))
          break

        case 'select':
          result = it.next(effect.selector(store.state))
          break

        case 'put':
          store.dispatch(effect.action)
          result = it.next()
          break

        case 'take':
          const action = await new Promise(
            resolve => store.actionsEmitter.once(effect.actionType, resolve)
          )
          result = it.next(action)
          break

        case 'fork':
          // TODO: return task to generator to allow cancellation
          runSaga(store, effect.saga, ...effect.args)
          result = it.next()
          break

        case 'cancel':
          // TODO
          break

        default:
          throw new Error(`Invalid effect type: ${effect.type}`)
      }
    }
  } catch (err) {
    console.error('Uncaught in runSaga', err)
  }
}

export const sagaPlugin: Plugin = {
  onModel(name: string, model: Model) {
    if (!model.sagas) {
      return
    }

    const sagas = this.sagas[name]

    for (const key in model.sagas) {
      // const type = createDispatcher(this, name, key)
    }
  },

  onStore(_store: Store) {
  },

  middleware: _store => next => (action: AnyAction) => {
    const result = next(action)
    return result
  }
}