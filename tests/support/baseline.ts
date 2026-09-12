import { execFileSync } from 'node:child_process';

/** Last commit before packaging. CI checks out history to make this immutable reference available. */
export const baselineCommit = 'd3c2c072a93fe5911aa83a7cf5790abb4fac432c';
export function baselineFile(path: string): string {
  return execFileSync('git', ['show', `${baselineCommit}:${path}`], {
    encoding: 'utf8',
  });
}
