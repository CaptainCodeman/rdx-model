# Rdx-Model

A wrapper for [rdx](https://github.com/CaptainCodeman/js-rdx), my tiny
Redux alternative, which makes bundling a state model small and simple.

Based on the approach of [redux-rematch](https://rematch.github.io/rematch/)
to reduce the boilerplate required when using a redux-like state store.

See [redesigning-redux](https://hackernoon.com/redesigning-redux-b2baee8b8a38)
for more background.

## Usage

Docs and example to follow, when API is more stable and typings refined.

## Plans

WebWorker plugin to workerize the state store
Saga middleware plugin as alternative to effects / thunks

## Notes

Effects should have the same call signature as reducers except the state
will be the root state for the store, not just the state for the model,
for use directly or passing to a selector function.

TODO: typing for the root state while in a model - do we just rely on
an import of the root state created from the store?

Using "this" to provide context: ideally we have quick access to the local 
model's reducer / effects dispatch.

Should we ever be dispatching to some _other_ models actions? Or should
other models only be able to listen to dispatched actions from our model?
i.e. that becomes the sole integration point.

Or, do we want to pass in the root store so any model can be called?

Use symbols for action types, provide constants (e.g. for router/change)
instead of relying on strings.