import { assert, IsExact } from "conditional-type-checks";

import { ActionFromReducer, ActionsFromReducers, ActionFromEffect, ActionsFromEffects, ModelDispatch } from "../model";

enum Things {
  One,
  Two,
}

// just some state with different property types
interface TestState {
  value: number;
}

// different patterns of reducer method arguments
// doesn't matter that reducer doesn't user payload - we're just testing the type transforms
const testReducers = {
  object(state: TestState, payload: { count: number }) {
    return state;
  },
  number(state: TestState, payload: number) {
    return state;
  },
  void(state: TestState) {
    return state;
  },
  boolean(state: TestState, payload: boolean) {
    return state;
  },
  string(state: TestState, payload: string) {
    return state;
  },
  enum(state: TestState, payload: Things) {
    return state;
  }
};

// expected dispatcher for the reducers above
interface testDispatcherType {
  object: (payload: { count: number; }) => void;
  number: (payload: number) => void;
  void: () => void;
  boolean: (payload: boolean) => void;
  string: (payload: string) => void;
  enum: (payload: Things) => void;
}

// test individual patterns
type objectActionType = ActionFromReducer<TestState, typeof testReducers.object>;
assert<IsExact<(payload: { count: number; }) => void, objectActionType>>(true);

type numberActionType = ActionFromReducer<TestState, typeof testReducers.number>;
assert<IsExact<(payload: number) => void, numberActionType>>(true);

type voidActionType = ActionFromReducer<TestState, typeof testReducers.void>;
assert<IsExact<() => void, voidActionType>>(true);

type booleanActionType = ActionFromReducer<TestState, typeof testReducers.boolean>;
assert<IsExact<(payload: boolean) => void, booleanActionType>>(true);

type stringActionType = ActionFromReducer<TestState, typeof testReducers.string>;
assert<IsExact<(payload: string) => void, stringActionType>>(true);

type enumActionType = ActionFromReducer<TestState, typeof testReducers.enum>;
assert<IsExact<(payload: Things) => void, enumActionType>>(true);

// test entire dispatch interface
type actionsDispatcherType = ActionsFromReducers<TestState, typeof testReducers>;
assert<IsExact<actionsDispatcherType, testDispatcherType>>(true);

// different patterns of effect method arguments
const testEffects = {
  object(payload: { count: number; }) { },
  number(payload: number) { },
  void() { },
  boolean(payload: boolean) { },
  string(payload: string) { },
  enum(payload: Things) { },
};

type objectEffectType = ActionFromEffect<typeof testEffects.object>;
assert<IsExact<(payload: { count: number; }) => void, objectEffectType>>(true);

type numberEffectType = ActionFromEffect<typeof testEffects.number>;
assert<IsExact<(payload: number) => void, numberEffectType>>(true);

type voidEffectType = ActionFromEffect<typeof testEffects.void>;
assert<IsExact<() => void, voidEffectType>>(true);

type booleanEffectType = ActionFromEffect<typeof testEffects.boolean>;
assert<IsExact<(payload: boolean) => void, booleanEffectType>>(true);

type stringEffectType = ActionFromEffect<typeof testEffects.string>;
assert<IsExact<(payload: string) => void, stringEffectType>>(true);

type enumEffectType = ActionFromEffect<typeof testEffects.enum>;
assert<IsExact<(payload: Things) => void, enumEffectType>>(true);

// test entire dispatch interface
type effectsDispatcherType = ActionsFromEffects<typeof testEffects>;
assert<IsExact<effectsDispatcherType, testDispatcherType>>(true);

// test combined (same reducers and effects)
type dispatcherType = ModelDispatch<TestState, typeof testReducers, typeof testEffects>;
assert<IsExact<dispatcherType, testDispatcherType>>(true);

const testCombineReducers = {
  add(state: number, payload: number) {
    return state + payload;
  }
};

const testCombineEffects = {
  async load(payload: string) { }
};

// expected dispatcher for the reducers above
interface testCombinedDispatcherType {
  add: (payload: number) => void;
  load: (payload: string) => void;
}

// test combined (different reducers and effects)
type combinedDispatcherType = ModelDispatch<number, typeof testCombineReducers, typeof testCombineEffects>;
assert<IsExact<combinedDispatcherType, testCombinedDispatcherType>>(true);
