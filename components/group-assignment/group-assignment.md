# `ld-group-assignment`

`ld-group-assignment` is a Web Component for computing a distribution of students into groups.

It supports:

- configurable defaults via HTML attributes
- an input panel for interactive data entry
- replacing the input panel with a result table after computation
- random assignment of students to groups
- group sizes where some groups may have **exactly one extra member** if distribution is not even

The component is designed to inherit styling from the surrounding page.

---

## Direct usage

Use it directly in HTML:

```html
<ld-group-assignment
    default-group-size="3"
    default-number-of-students="25"></ld-group-assignment>
```

### Attributes

Both attributes are optional:

- `default-group-size`: positive integer (e.g. `2`, `3`, `4`)
- `default-number-of-students`: positive integer (e.g. `25`)

If omitted, component-internal defaults are used.

---

## Wrapper/module-based usage

A lightweight wrapper transforms LectureDoc module entries (`.module.group-assignment`) into `<ld-group-assignment>` elements before LectureDoc DOM manipulations.

Expected module JSON format:

```/dev/null/group-assignment-spec.json#L1-4
{
  "defaultNumberOfStudents": 25,
  "defaultGroupSize": 2
}
```

Both values are optional.

### Example module block

```/dev/null/module-example.html#L1-7
<template>
  <div class="module group-assignment">
{
  "defaultNumberOfStudents": 25,
  "defaultGroupSize": 2
}
  </div>
</template>
```

---

## Distribution behavior

Given:

- number of students `N`
- requested group size `S`

the component computes groups such that:

- all groups have size `S` or `S + 1`
- if `N` is not evenly divisible, some groups get one extra member
- students are assigned randomly to groups

The rendered result includes:

- summary data (students, requested size, total groups)
- concrete random group listings (e.g. `Group 1: 7, 12, 3`)

---

## Implementation notes

- Uses modern JavaScript (`class`, private fields/methods, custom element lifecycle APIs).
- Implemented as a proper custom element (`<ld-group-assignment>`).
- No shadow root is required for core rendering, enabling inherited page styling.
- Wrapper is intended to be loaded in LectureDoc context, similar in spirit to timeline preprocessing.
