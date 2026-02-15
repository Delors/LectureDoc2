# `ld-group-assignment`

`ld-group-assignment` is a Web Component for computing a distribution of students into groups.

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

## Example Usage

See [HTML Example](group-assignment-example.html).
