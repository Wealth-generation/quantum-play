export const PLINKO_BUCKET_FEEDBACK_DURATION_MS = 210;
export const PLINKO_PEG_FEEDBACK_DURATION_MS = 700;

export type BucketFeedbacks = Map<number, number>;
export type PegFeedbacks = Map<string, number>;

export function triggerBucketFeedback(
  feedbacks: BucketFeedbacks,
  bucketIndex: number,
  now: number,
) {
  feedbacks.set(bucketIndex, now);
}

export function triggerPegFeedback(
  feedbacks: PegFeedbacks,
  pegId: string,
  now: number,
) {
  feedbacks.set(pegId, now);
}

export function pruneFeedbacks<Key>(
  feedbacks: Map<Key, number>,
  now: number,
  durationMs: number,
) {
  for (const [id, startedAt] of feedbacks) {
    if (now - startedAt >= durationMs) {
      feedbacks.delete(id);
    }
  }
}
