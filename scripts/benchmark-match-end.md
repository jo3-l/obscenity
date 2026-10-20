# Match endpoint benchmark

This benchmark compares compiled revisions of the collapsed-duplicate endpoint fix.
It measures `getAllMatches` and `hasMatch` separately, with matchers constructed
outside the timed loops. Fixtures cover short clean text, short repeated text,
long clean text, Unicode, and a focused single-pattern repeated-character workload.

Each revision runs in three fresh Node processes, with the revision order rotated
between rounds. Each case/method receives at least 300 ms of warmup, followed by
batch calibration to at least 100 ms and seven timed samples. The report gives the
median of all 21 samples and the three individual process medians. Explicit GC
runs outside each timed sample; allocation and natural GC during a call remain
part of its timing. Timings describe these fixtures on this machine, not a
universal speed guarantee.

The harness checks that detection, term IDs, start indices, and transformed match
lengths agree across revisions. Reported end indices intentionally differ. It
also counts the numeric entries in the arrays returned by a transformation pass
on the focused fixture. That count is not an estimate of total heap use or RSS.
The diagnostic uses TypeScript-private members available in the compiled JS and
is not a new public API.

## Reproduce

Run from the repository root after `pnpm install --frozen-lockfile`. The original
PR is `eef6b739c0f4d5200821faf84df60b5c93528db8`; the measured main revision is
`32c9061c1ad18de43432e4e59084189628f2a2a4`. Their source is compiled with the same
TypeScript installation as the revision under test. No benchmark dependencies
are added to the package.

```sh
benchmark_dir=$(mktemp -d)
mkdir -p "$benchmark_dir/main" "$benchmark_dir/original"
git archive 32c9061c1ad18de43432e4e59084189628f2a2a4 src tsconfig.base.json | tar -x -C "$benchmark_dir/main"
git archive eef6b739c0f4d5200821faf84df60b5c93528db8 src tsconfig.base.json | tar -x -C "$benchmark_dir/original"
pnpm exec tsc -b "$benchmark_dir/main/src"
pnpm exec tsc -b "$benchmark_dir/original/src"
pnpm build
node scripts/benchmark-match-end.cjs \
  main="$benchmark_dir/main/dist/index.js" \
  original="$benchmark_dir/original/dist/index.js" \
  revised=./dist/index.js
```

Use Node 24 to compare with the checked-in results. The script itself uses
`process.execPath` for every child process, so all variants use the same runtime.

## Results

Measured on Node 24.22.0, macOS arm64, Apple M5, comparing `main` (`32c9061`), the original PR (`eef6b73`), and this revision. Median of 21 samples across three fresh processes per revision, with rotated order, 300 ms warmup per case/method, and calibrated batches of at least 100 ms. Construction and explicit GC are outside the timed loops.

Compared with the original PR:

- Focused repeated-character fixture: **8.1% less time for `getAllMatches`**, **18.2% less for `hasMatch`**.
- Long clean English-preset fixture: **8.3% less time for `getAllMatches`**, **11.7% less for `hasMatch`**.
- Short repeated English-preset text is essentially unchanged (0.3% / 1.9% differences).
- One transformation pass on the focused fixture stores **128 mapping entries instead of 256**, a **50% reduction in index-mapping entries**, matching `main`. This is not a claim of 50% less total application memory.

The primary benefit over `main` is fixing the reported span while retaining its single-array transformation path. These measurements do not establish a general speedup over `main`: the focused `getAllMatches` case is 0.8% slower, and per-process medians include outliers. Treat small timing differences as noise.

| Fixture / method | main (µs) | Original PR (µs) | Revised (µs) | Less time vs original |
| --- | ---: | ---: | ---: | ---: |
| english/short-clean/getAllMatches | 13.15 | 13.45 | 12.46 | 7.3% |
| english/short-clean/hasMatch | 13.23 | 13.21 | 12.69 | 3.9% |
| english/short-repeats/getAllMatches | 10.35 | 10.26 | 10.23 | 0.3% |
| english/short-repeats/hasMatch | 6.89 | 6.84 | 6.71 | 1.9% |
| english/long-clean/getAllMatches | 413.60 | 439.74 | 403.16 | 8.3% |
| english/long-clean/hasMatch | 405.06 | 446.61 | 394.55 | 11.7% |
| english/unicode/getAllMatches | 12.26 | 12.12 | 11.32 | 6.7% |
| english/unicode/hasMatch | 8.12 | 8.36 | 7.85 | 6.1% |
| focused/repeats/getAllMatches | 7.48 | 8.21 | 7.54 | 8.1% |
| focused/repeats/hasMatch | 5.75 | 6.85 | 5.61 | 18.2% |

See [the JSON report](benchmark-match-end-results.json) for individual process medians and source revisions.
