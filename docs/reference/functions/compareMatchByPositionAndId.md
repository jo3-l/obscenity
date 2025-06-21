[**obscenity**](../README.md)

***

[obscenity](../README.md) / compareMatchByPositionAndId

# Function: compareMatchByPositionAndId()

> **compareMatchByPositionAndId**(`a`, `b`): `-1` \| `0` \| `1`

Defined in: [src/matcher/MatchPayload.ts:57](https://github.com/jo3-l/obscenity/blob/a386fd116c14542130a643879987c21c9c8a4eb9/src/matcher/MatchPayload.ts#L57)

Compares two match payloads.

If the first match payload's start index is less than the second's, `-1` is
  returned;
If the second match payload's start index is less than the first's, `1` is
  returned;
If the first match payload's end index is less than the second's, `-1` is
  returned;
If the second match payload's end index is less than the first's, `1` is
  returned;
If the first match payload's term ID is less than the second's, `-1` is
  returned;
If the first match payload's term ID is equal to the second's, `0` is
  returned;
Otherwise, `1` is returned.

## Parameters

### a

[`MatchPayload`](../interfaces/MatchPayload.md)

First match payload.

### b

[`MatchPayload`](../interfaces/MatchPayload.md)

Second match payload.

## Returns

`-1` \| `0` \| `1`

The result of the comparison: -1 if the first should sort lower than
the second, 0 if they are the same, and 1 if the second should sort lower
than the first.
