---
title: "Understanding the Power of LISP"
date: 2020-04-03T20:00:35-08:00
draft: false
summary: "Notable programmers describe understanding and coding in LISP as a semi-religious experience. What gives the language this power?"
type: "post"
categories:
- Programming
tags:
- LISP
---

Paul Graham describes LISP as the convergence point for all programming languages. His observation is that as languages mature, the average language continues to slide towards LISP. Therefore understanding LISP is to understand the fundamental model of modern programming.

Others tout LISP as necessary to becoming a better programmer. Eric Raymond went so far as to say that understanding LISP is a "profound enlightenment experience."

In search of this understanding, I went to the source. John McCarthy's original paper {{< externallink "Recursive Functions of Symbolic Expressions and Their Computation by Machine" "http://www-formal.stanford.edu/jmc/recursive/recursive.html" >}} that laid the foundation for LISP.

It is a dense, exploratory paper written by a genius for early computer scientists. Not a digestible piece of documentation meant to guide others to understanding LISP. I struggled through each sentence before stumbling upon Paul Graham's article {{< externallink "The Roots of LISP" "http://www.paulgraham.com/rootsoflisp.html" >}}. His clarity helped guide me to that elusive sense of understanding.

But it wasn't until I wrote this article that I gained a full grasp of the language and its power. I'm leaving my steps here for any who have gone down a similar path and still struggle to understand.

Keeping true to Paul Graham, I implemented this version of LISP in {{< externallink "Arc" "http://www.arclanguage.org/tut.txt" >}}. You can find the full code {{< externallink "here" "https://gist.github.com/joshuabradley012/d8e86fcbabac04b230b37e0f173259f5" >}}.

## List expressions

Originally, John McCarthy had defined symbolic expressions (S-expressions) and meta expressions (M-expressions). S-expressions were to contain lists of symbols, while M-expressions were to denote functions.

```
; S-expression
((ab . c) . d . nil)

; M-expression
eq[x; x]
; returns t
```

However, the computer they used to first implement LISP was missing square brackets, so everything was written in S-expression notation.<sup><a href="#ref:1">1</a></sup> Dots were omitted and the `nil` that terminates lists is assumed.

So the above M-expression becomes

```
(eq x x)
; returns t
```

which became the standard syntax for LISP, making the language syntactically uniform.

## Elementary functions

There are very few elementary functions necessary to make LISP a complete language. Many complexities, such as memory allocation and garbage collection, are handled by the compiler.

A brief introduction to the syntax of LISP is helpful because some aspects are not intuitive. In particular, quotes and inside-out evaluation.

Quotes are necessary for LISP because there is no separation of data and code. Sequences of characters can be interpreted as variables or values depending on their context. Quoting characters solves this by forcing a literal interpretation of values.

Without quote, `(eq x x)` will attempt to find the defined value of `x` and throw an error if not found. While `(eq 'x 'x)` returns `t`. Keep in mind this is shorthand for `(eq (quote x) (quote x))`.

Inside-out interpretation feels very unnatural because we are trained to read left-to-right, even in programming languages. When reading expressions such as `(outer (inner '(a b)))` you might expect `outer` to be evaluated first. However, `inner` will be the first to evaluate.

Armed with this basic understanding, you're ready for the 5 elementary functions necessary for LISP.

### `atom`

Checks if an element is a single symbol.

```
(atom 'x)
; returns t

(atom '(a b))
; returns nil
```

### `eq`

Checks if two atomic symbols are the same. In Arc, this is written as `is`.

```
(eq 'x 'x)
; returns t

(eq 'x 'y)
; returns nil

(eq '(a b) '(a b))
; (a b) is a list and cannot be evaluated by eq
; returns nil
```

### `car`

Stands for contents of the address register. It returns the first item in a list, as long as it isn't atomic.

```
(car '(x a))
; returns x

(car '((x a) y))
; returns (x a)
```

### `cdr`

Stands for contents of the decrement register. It returns everything after the first item in a list.

```
(cdr '(x a))
; returns a

(cdr '((x a) y))
; returns y

(cdr '((x a) (y b)))
; returns (y b)
```

### `cons`

Is used to construct a list from atoms or other lists.

```
(cons 'x 'a)
; returns (x . a)
; lists should typically end in nil
; so it is better to write (cons x (cons a nil))
; which returns (x . a . nil)
; and can be written as (x a)

(cons '(x a) 'y)
; returns ((x a) . y)

(cons '(x a) '(y b))
; returns ((x a) y b)
```

## Foundational functions

These functions form the core of the "universal function" which is the ultimate end of this implementation.

Because I am implementing this in Arc, I will be moving away from John McCarthy's use of `=` to define functions and `[condition -> expression; T -> expression]` syntax for `if...else` conditions. Instead, I will use `def` and `if` as defined in Arc.

Other differences include using `is` for `eq` and I will prefix all functions with `_` to avoid conflicts with existing functions. Additionally, `t` represents truth and `nil` represents falsity.

If you have trouble following the syntax, I suggest reading Paul Graham's {{< externallink "Arc tutorial" "http://www.arclanguage.org/tut.txt" >}} first.

### `_null`

Evaluates if the expression is empty.

```
(def _null (x)
  (is x nil))

(_null nil)
; returns t

(_null '(x a))
; returns nil
```

### `_and`

Evaluates if both conditions are true. In Arc, `t` represents true, and `nil` represents false.

```
(def _and (x y)
  (if (is x t) (is y t) t nil))

(_and 'x 'y)
; returns t

(_and 'x nil)
; returns nil
```

### `_not`

Evaluates if the condition is `nil`.

```
(def _not (x)
  (if (is x nil) t))

(_not nil)
; returns t

(_not 'x)
; returns nil
```

### `_caar`, `_cadr`, `_caddr`, `_cadar`, and `_caddar`

These are shorthand for combinations of `car` and `cdr`. They occur often so the shorthand keeps your code DRY.

```
(def _caar (x)
  (car (car x)))

(def _cadr (x)
  (car (cdr x)))

(def _cadar (x)
  (car (cdr (car x))))

(def _caddr (x)
  (car (cdr (cdr x))))

(def _caddar (x)
  (car (cdr (cdr (car x)))))

(_cadr '(a b c d))
; returns b

(_caddr '(a b c d))
; returns c

(_cadar '((a b c d) (e f g)))
; returns b

(_caddar '((a b c d) (e f g)))
; returns c
```

### `_append`

Allows you to join lists.

```
(def _append (x y)
  (if (_null x) y (cons (car x) (_append (cdr x) y))))

(_append '(a b) '(c d))
; returns (a b c d)
```

### `_list`

Creates a list from two expressions. The distinction between this and `cons` is that `_list` will append `nil` for you.

This maintains the integrity of lists that you pass as arguments and removes the need for an additional `cons` when joining two atoms.

```
(def _list (x y)
  (cons x (cons y nil)))

(_list 'a 'b)
; returns (a b)

(_list '(a b) '(c d))
; returns ((a b) (c d))
```

### `_pair`

Joins two lists creating pairs based on the position of each element.

```
(def _pair (x y)
  (if (_and (_null x) (_null y)) nil
      (_and (_not (atom x)) (_not (atom y)))
      (cons (_list (car x) (car y))
            (_pair (cdr x) (cdr y)))))

(_pair '(x y z) '(a b c))
; returns ((x a) (y b) (z c))
```

### `_assoc`

Gets values from key-value pairs, where the first argument is the key and the second argument is a list of pairs.

```
(def _assoc (x y)
  (if (is (caar y) x) (_cadar y)
    (_assoc x (cdr y))))

(_assoc 'y '((x a) (y b)))
; returns b

(_assoc 'x '((w (a b)) (x (c d)) (y (e f))))
; returns (c d)
```

## The universal function

The true power of LISP is its ability to evaluate itself from a few building blocks. As John McCarthy did, we will be defining `_eval` which can evaluate LISP in LISP.

This is the most surprising and powerful aspect of the language. With 5 primitives and 12 functions, you have the building blocks to build an interpreter.

```
(def _eval (e a)
  (if
    (atom e) (_assoc e a)
    (atom (car e)) (if
      (is (car e) 'quote) (_cadr e)
      (is (car e) 'atom)  (atom (_eval (_cadr  e) a))
      (is (car e) 'eq)    (is   (_eval (_cadr  e) a)
                                (_eval (_caddr e) a))
      (is (car e) 'car)   (car  (_eval (_cadr  e) a))
      (is (car e) 'cdr)   (cdr  (_eval (_cadr  e) a))
      (is (car e) 'cons)  (cons (_eval (_cadr  e) a)
                                (_eval (_caddr e) a))
      (is (car e) 'cond)  (_evcon (cdr e) a)
      (_eval (cons (_assoc (car e) a)
                   (cdr e))
             a))
    (is (caar e) 'label)
      (_eval (cons (_caddar e) (cdr e))
             (cons (_list (_cadar e) (car e)) a))
    (is (caar e) 'lambda)
      (_eval (_caddar e)
             (_append (_pair (_cadar e) (_evlis (cdr e) a))
                      a))))

(def _evcon (c a)
  (if (_eval (_caar c) a)
      (_eval (_cadar c) a)
      (_evcon (cdr c) a)))

(def _evlis (m a)
  (if (_null m) nil
      (cons (_eval  (car m) a)
            (_evlis (cdr m) a))))
```

When using `_eval` the syntax of the contained expressions will be specific to the interpreter. We aren't writing in Arc anymore, but a completely new language. The primitive form of LISP.

Even if you have been following along, there is a lot to break down here, so let's step through it.

### Interpreting elementary functions

`_eval` takes `e` as the expression to be evaluated and `a` as a list of pairs that will be referenced by `e`.

If `e` is atomic `_assoc` is called to return the value that matches the key `e` in `a`.

```
(_eval 'x '((x a) (y b)))
; returns a

(_eval 'y '((x a) (y b)))
; returns b
```

If `e` is not atomic, then `_eval` checks if the first element of `e` is one of the elementary functions.

In the case of `quote` the symbol following `quote` is returned literally.

```
(_eval '(quote x) nil)
; nil is needed because _eval requires two arguments
; returns x

(_eval '(quote (x a)) nil)
; returns (x a)
```

With other elementary functions, `e` takes the form `(function key)`, where `key` is used to get a value from `a` that will be evaluated by `function`.

The following use of `_eval` is equivalent to the much simpler `(atom 'y)` but it is core to understanding the `_eval` function. Notice how `x` is being used to reference the value in the second parameter, `a`.

```
(_eval '(atom x) '((x y)))
; returns t

(_eval '(atom x) '((x (a b))))
; returns nil
```

For every elementary function except `quote` there are recursive `_eval` calls being made until it reaches `_assoc` or `quote`.

These are the steps `_eval` takes to evaluate `atom`.

```
(_eval '(atom x) '((x y)))
; (atom (_eval (_cadr e) a))
; (atom (_eval  x ((x y))))
; (atom (_assoc x ((x y))))
; (atom y)
; returns t
```

`car` and `cdr` have a very similar structure to `atom` because only one expression has to be evaluated.

```
(_eval '(car x) '((x (a b c))))
; returns a

(_eval '(cdr x) '((x (a b c))))
; returns (b c)
```

`cons` and `eq` have two expressions that need to be evaluated. As such, `a` needs to contain two pairs.

```
(_eval '(eq x y) '((x a) (y a)))
; returns t

(_eval '(cons x y) '((x a) (y b)))
; returns (a . b)
```

`cond` makes use of a new function, `_evcon` which takes a list of pairs with the format `(condition expression)`. When a true condition is found, that expression is evaluated.

```
(def _evcon (c a)
  (if (_eval (_caar c) a)
      (_eval (_cadar c) a)
      (_evcon (cdr c) a)))

(_evcon '(((atom c1) a1) ((atom c2) a2) ((atom c3) a3))
        '((c1 (a b)) (a1 not_atom)
          (c2 (c d)) (a2 still_not_atom)
          (c3 e)     (a3 is_atom)))
; returns is_atom
```

Here is the same expression using `_eval`.

```
(_eval '(cond ((atom c1) a1) ((atom c2) a2) ((atom c3) a3))
       '((c1 (a b)) (a1 not_atom)
         (c2 (c d)) (a2 still_not_atom)
         (c3 e)     (a3 is_atom)))
; returns is_atom
```

### Interpreting `label` and `lambda` functions

If `e` is atomic but isn't an elementary function, it must be a `label` or `lambda` function defined by the user.

`lambda` expressions take the format `(lambda (param) (expression) arg)` where `arg` will be passed to `expression` through `param`.

```
(_eval '((lambda (param)
           (cond ((atom param) (quote is_atom))
                 ((quote t)    (quote not_atom))))
          arg)
       '((arg (a b))))
; returns not_atom
```

Note that `(quote t)` is used here as an explicit `else` condition. Arc handles these cases gracefully, but because we are bound to the rules of the interpreter we must use this syntax.

During evaluation, the above `lambda` expression becomes

```
(_eval '(cond ((atom param) (quote is_atom))
              ((quote t)    (quote not_atom)))
       '((param (a b)) (arg (a b))))
```

Notice how the arguments are extended to contain a pair for `param`. This makes use of the supplementary `_evlis` function which recursively constructs a list of pairs from `arg` for each `param` in `lambda`. This allows `lambda` to handle any list of parameters.

`((lambda (`*p<sub>1</sub>*`...`*p<sub>n</sub>*`) `*e*`) `*a<sub>1</sub>*`...`*a<sub>n</sub>*`)` is the formal definition.

`label` allows functions to be called by name, which is arguably the most important feature of any programming language.

Here, McCarthy defines `ff` as a function to return the first atom in a list. It makes use of labeled recursion.

```
(_eval '((label ff (lambda (x)
                     (cond ((atom x) x)
                           ((quote t) (ff (car x))))))
         y)
       '((y ((a b) c))))
; returns a
```

When `_eval` finds `label`, it will store that function in `a` to be used later. It will also begin evaluating the `lambda` function defined by `label`. During evaluation, the above expression becomes

```
(_eval '((lambda (x)
           (cond ((atom x) x)
                 ((quote t) (ff (car x)))))
         y)
       '((ff (label ff (lambda (x)
               (cond ((atom x) x)
                     ((quote t) (ff (car x)))))))
         (y ((a b) c))))
```

The full evaluation is, as McCarthy puts it, "an activity better suited to electronic computers than to people." I agree and won't be listing out every step of evaluation.

### Simplifying `_eval`

Using `_eval` in its raw form is rather verbose, so McCarthy defined `_apply` as a wrapper to `_eval` that helps keep expressions shorter and easier to understand.

This will take the parameters for `_eval` and wrap them like `(quote (param))`. It also applies arguments directly to the function.

```
(def _appq (m)
  (if (_null m) nil (cons (_list 'quote (car m))
                          (_appq (cdr m)))))

(def _apply (f args)
  (_eval (cons f (_appq args)) nil))
```

Using this function, the `ff` function can be written as

```
(_apply '(label ff (lambda (x)
                     (cond ((atom x) x)
                           ((quote t) (ff (car x))))))
        '(a b))
```

which calls `_eval` as

```
(_eval '((label ff (lambda (x)
                     (cond ((atom x) x)
                           ((quote t) (ff (car x))))))
          (quote a) (quote b))
       'nil)
```

`_apply` can be used for anything you would write using `_eval`. But it is useful to first understand `_eval` before adding this layer of abstraction.

## Takeaways

The ability to define new languages, and monitor their internal state makes LISP an excellent language for exploration and experimentation.

Gone is the magic of compilation and executables. You can see every step of evaluation for yourself. That makes the exercise of stumbling through the archaic syntax fulfilling.

I don't see myself using LISP in production. However, I will continue to use it as a tool for broadening my understanding of low-level programming.

The next step for me is to understand how to implement a compiler that would convert this to machine code. I plan to read {{< externallink "Structure and Interpretation of Computer Programs" "https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-1.html" >}} to do so.

Additionally, I would like to modernize this interpreter. As Paul Graham wrote, "The language he [John McCarthy] wrote in 1960 was missing a lot. It has no side-effects, no sequential execution, no practical numbers, and dynamic scope." But this can be addressed.

Paul Graham hints at Steele and Sussman's article, {{< externallink "The Art of the Interpreter" "https://wiki.c2.com/?TheArtOfTheInterpreter" >}} without getting into specifics. Perhaps I'll go through these in another article.

Digging through the history of programming, you'll find LISP's influence everywhere. The exercise of adjusting to its syntax is a worthy pursuit in itself, but developing that true sense of understanding opens a window into the inner workings of all languages. That is the purpose of understanding LISP.

---

<ol><li id="ref:1">Sinclair Target. "How Lisp Became God's Own Programming Language", Two Bit History, October 14, 2018, accessed April 3, 2020, {{< externallink "https://twobithistory.org/2018/10/14/lisp.html" "https://twobithistory.org/2018/10/14/lisp.html" >}}</li></ol>