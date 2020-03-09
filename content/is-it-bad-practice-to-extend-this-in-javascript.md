---
title: "Is It Bad Practice to Extend `this` in JavaScript classes?"
date: 2020-03-01T20:35:56-08:00
draft: false
type: "post"
summary: "What is better practice? To set a property on 'this', or to extend 'this' using 'Object.assign'. I see merits for both."
categories:
- Programming
tags:
- JavaScript
---

What is better practice? To set properties on `this`, or to extend `this` using `Object.assign`. I see merits for both.

Setting properties on `this` results in better immutability and less, expensive `Object.assign` calls.

Extending `this` leads to more elegant classes that are easier to understand. But it comes with the danger of collisions.

## Setting properties

Let's start with a base class.

{{< highlight javascript >}}
class BaseObject {
  constructor(props = {}) {
    this.props = props
  }

  set(props) {
    this.props = props
    return this
  }

  get(prop) {
    return this.props[prop]
  }

  isEmpty() {
    return Object.entries(this.props).length === 0
  }
}
{{< / highlight >}}

Great! Now we have a class that adds some useful features not available in vanilla JavaScript.

{{< highlight javascript >}}
const empty = new BaseObject()
empty.isEmpty() // true

const filled = new BaseObject({ a: 1 })
filled.isEmpty() // false
{{< / highlight >}}

But you can already see that the object itself has properties that aren't intuitive to the end user.

{{< highlight javascript >}}
console.log(filled) // BaseObject { props: { a: 1 } }
{{< / highlight >}}

You can imagine a beginner wondering _"I didn't specify `props`, where did it come from?"_ And in order access values you either have to use `get()`, or remember to use `props` first.

{{< highlight javascript >}}
filled.get('a') // 1
filled.props.a // 1
{{< / highlight >}}

Extending `BaseObject` inherits these disadvantages. In particular always having to use `this.props` instead of `this`.

{{< highlight javascript >}}
class Item extends BaseObject {
  constructor(props) {
    super(props)
    this.has = this.has.bind(this)
  }

  has([key, value]) {
    return this.props[key] === value
  }

  hasAll(args) {
    return Object.entries(args).every(this.has)
  }
}
{{< / highlight >}}

{{< highlight javascript >}}
const item = new Item().set({ a: 1, b: 2 })
console.log(item) // Item { props: { a: 1, b: 2 }, has: ƒ () }

item.hasAll({ a: 1, c: 3 }) // false
item.hasAll({ a: 1, b: 2 }) // true
{{< / highlight >}}

## Extending `this`

Implementing a class that extends `this` is less intuitive than using properties. But the result is an elegant API.

Let's start with that base class again.

{{< highlight javascript >}}
class BaseObject {
  constructor(props) {
    Object.assign(this, props)
  }

  set(props) {
    return Object.assign(this, props)
  }

  get(prop) {
    return this[prop]
  }

  isEmpty() {
    return Object.entries(this).length === 0
  }
}
{{< / highlight >}}

Now when we create a new instance of the object, the object is exactly what you set it to be.

{{< highlight javascript >}}
const filled = new BaseObject({ a: 1 })
console.log(filled) // BaseObject { a: 1 }
{{< / highlight >}}

Beautiful!

I added a getter for consistency but in practice it's redundant. Accessing values is intuitive.

{{< highlight javascript >}}
filled.get('a') // 1
filled.a // 1
{{< / highlight >}}

Which has the added benefit of making extension easy. You simply have to use `this`.

{{< highlight javascript >}}
class Item extends BaseObject {
  constructor(props) {
    super(props)
    this.has = this.has.bind(this)
  }

  has([key, value]) {
    return this[key] === value
  }

  hasAll(args) {
    return Object.entries(args).every(this.has)
  }
}
{{< / highlight >}}

{{< highlight javascript >}}
const item = new Item().set({ a: 1, b: 2 })
console.log(item) // Item { a: 1, b: 2, has: ƒ () }

item.hasAll({ a: 1, c: 3 }) // false
item.hasAll({ a: 1, b: 2 }) // true
{{< / highlight >}}

But wait a minute, what's `has` doing there in the same scope as the values I passed in?

That's a side effect of creating bound methods. And now it is possible to collide with existing methods.

{{< highlight javascript >}}
new Item({ place: 'Fruit Stand', has: 'Apples' })
// Uncaught TypeError: this.has.bind is not a function
{{< / highlight >}}

Well... Damn. 

I could refactor my code to avoid bound methods.

{{< highlight javascript >}}
class SaferItem extends BaseObject {
  constructor(props) {
    super(props)
  }

  has(key, value) {
    return this[key] === value
  }

  hasAll(args) {
    return Object.entries(args).every(([key, value]) => this.has(key, value))
  }
}
{{< / highlight >}}

{{< highlight javascript >}}
const fruitStand = new SaferItem({ place: 'Fruit Stand', has: 'Apples' })
console.log(item) // SaferItem { place: 'Fruit Stand', has: 'Apples' }
{{< / highlight >}}

Which actually seems to be a better implementation. But now I need to have this awareness when developing classes.

---

The crux of extending `this` is its danger. Having objects closer to vanilla JavaScript is beautiful. But collisions will lead to bugs. Because of that, setting properties is now my preferred method.

What do you think?

For further discussion, check out the {{< externallink "Stackoverflow" "https://stackoverflow.com/questions/60482201/is-it-a-bad-practice-to-extend-overwrite-this-with-object-assign" >}} thread.