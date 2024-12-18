export type Objectish = AnyObject | AnyArray | AnyMap | AnySet
export type ObjectishNoSet = AnyObject | AnyArray | AnyMap

export type AnyObject = {[key: string]: any}
export type AnyArray = Array<any>
export type AnySet = Set<any>
export type AnyMap = Map<any, any>

export const enum ArchType {
	Object,
	Array,
	Map,
	Set
}

export interface ImmerBaseState {
	parent_?: ImmerState
	scope_: any
	modified_: boolean
	finalized_: boolean
	isManual_: boolean
}

export type ImmerState = any

export const DRAFT_STATE: unique symbol = Symbol.for("immer-state")

// The _internal_ type used for drafts (not to be confused with Draft, which is public facing)
export type Drafted<Base = any, T extends ImmerState = ImmerState> = {
	[DRAFT_STATE]: T
} & Base


export function each<T extends Objectish>(
	obj: T,
	iter: (key: string, value: any, source: T) => void
): void
export function each(obj: any, iter: any) {
	if (getArchtype(obj) === ArchType.Object) {
		Reflect.ownKeys(obj).forEach(key => {
			iter(key, obj[key], obj)
		})
	} else {
		obj.forEach((entry: any, index: any) => iter(index, entry, obj))
	}
}

/*#__PURE__*/
export function isMap(target: any): target is AnyMap {
	return target instanceof Map
}

/*#__PURE__*/
export function isSet(target: any): target is AnySet {
	return target instanceof Set
}

/*#__PURE__*/
export function getArchtype(thing: any): ArchType {
	const state: undefined | ImmerState = thing[DRAFT_STATE]
	return state
		? state.type_
		: Array.isArray(thing)
		? ArchType.Array
		: isMap(thing)
		? ArchType.Map
		: isSet(thing)
		? ArchType.Set
		: ArchType.Object
}
