import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { StageProgress } from '../components/conversion/stage-progress';
afterEach(cleanup);
describe('Accurate conversion status',() => {
 it('does not claim a rendered preview for structurally ready JSON',() => {
  render(<StageProgress overallStatus="preview_ready" currentStage="elementor_validation" />);
  const label=screen.getByText('Preview & QA');
  expect(within(label.parentElement!.parentElement!).getByText('Not performed')).toBeTruthy();
  expect(within(label.parentElement!.parentElement!).queryByText('Completed')).toBeNull();
 });
 it('reports a failed active stage even if a prior attempt completed it',() => {
  render(<StageProgress overallStatus="failed" currentStage="elementor_validation" stages={[{id:'s',jobId:'j',stage:'elementor_validation',status:'completed',attempt:1,createdAt:'',updatedAt:''}]} />);
  const label=screen.getByText('Stage D: Structural Verification');
  expect(within(label.parentElement!.parentElement!).getByText('Failed')).toBeTruthy();
 });
});
